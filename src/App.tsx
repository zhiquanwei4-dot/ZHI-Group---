import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Overview } from './components/Overview';
import { LocalDirectory } from './components/LocalDirectory';
import { Registration } from './components/Registration';
import { Approval } from './components/Approval';
import { Rules } from './components/Rules';
import { Button } from './components/UI';
import { Download, Upload, RotateCcw, Menu, X } from 'lucide-react';
import { cn } from './lib/utils';
import * as XLSX from 'xlsx';
import { 
  TestProject, 
  LocalPlatformItem, 
  RegistrationRecord, 
  ApprovalRecord,
  ApprovalStatus,
  User
} from './types';
import { mockTestProjects, mockLocalItems } from './constants';
import { auth, db, loginWithGoogle, logout, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('rules');
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [prefilledProject, setPrefilledProject] = useState<string | null>(null);

  // State
  const [testProjects, setTestProjects] = useState<TestProject[]>([]);
  const [localItems, setLocalItems] = useState<LocalPlatformItem[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Check/Create user profile
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const profile = userDoc.data() as User;
            setUserProfile(profile);
            const adminEmails = ['zhiquanwei4@gmail.com', 'test_institution@gmail.com'];
            const adminStatus = profile.role === 'admin' || (firebaseUser.email && adminEmails.includes(firebaseUser.email.toLowerCase()));
            console.log('User logged in, isAdmin:', adminStatus);
            setIsAdmin(adminStatus);
          } else {
            const adminEmails = ['zhiquanwei4@gmail.com', 'test_institution@gmail.com'];
            const isDefaultAdmin = firebaseUser.email && adminEmails.includes(firebaseUser.email.toLowerCase());
            const newProfile: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              role: isDefaultAdmin ? 'admin' : 'user'
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
            console.log('New user profile created, isAdmin:', newProfile.role === 'admin');
            setIsAdmin(newProfile.role === 'admin');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listeners
  useEffect(() => {
    const unsubProjects = onSnapshot(collection(db, 'testProjects'), (snapshot) => {
      try {
        const projects = snapshot.docs.map(doc => {
          const data = doc.data();
          return { ...data, id: doc.id } as TestProject;
        });
        console.log('Firestore projects updated:', projects.length, 'items');
        
        // Merge Firestore projects with mock projects (Firestore takes priority)
        const merged = [...projects];
        mockTestProjects.forEach(mock => {
          if (!projects.find(p => p.id === mock.id)) {
            merged.push(mock);
          }
        });
        console.log('Final merged projects count:', merged.length);
        setTestProjects(merged);
      } catch (err) {
        console.error('Error processing testProjects snapshot:', err);
      }
    }, (error) => {
      console.error('Firestore Projects Listener Error:', error);
      handleFirestoreError(error, OperationType.LIST, 'testProjects');
    });

    const unsubLocal = onSnapshot(collection(db, 'localItems'), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as LocalPlatformItem);
      // Merge Firestore items with mock items (Firestore takes priority)
      const merged = [...items];
      mockLocalItems.forEach(mock => {
        if (!items.find(i => i.id === mock.id)) {
          merged.push(mock);
        }
      });
      setLocalItems(merged);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'localItems'));

    return () => {
      unsubProjects();
      unsubLocal();
    };
  }, []);

  useEffect(() => {
    const qReg = query(collection(db, 'registrations'));
    const qAppr = query(collection(db, 'approvals'));

    const unsubReg = onSnapshot(qReg, (snapshot) => {
      setRegistrations(snapshot.docs.map(doc => doc.data() as RegistrationRecord));
    }, (error) => {
      // Don't show error to non-admins if it's just a permission issue on initial load
      if (error instanceof Error && error.message.includes('insufficient permissions')) {
        console.warn('Insufficient permissions to list registrations');
        return;
      }
      handleFirestoreError(error, OperationType.LIST, 'registrations');
    });

    const unsubAppr = onSnapshot(qAppr, (snapshot) => {
      setApprovals(snapshot.docs.map(doc => doc.data() as ApprovalRecord));
    }, (error) => {
      if (error instanceof Error && error.message.includes('insufficient permissions')) {
        console.warn('Insufficient permissions to list approvals');
        return;
      }
      handleFirestoreError(error, OperationType.LIST, 'approvals');
    });

    return () => {
      unsubReg();
      unsubAppr();
    };
  }, []);

  // Handlers
  const handleAddRegistration = async (record: RegistrationRecord) => {
    const newRecord = { ...record };
    if (user) {
      newRecord.authorUid = user.uid;
    }
    try {
      await setDoc(doc(db, 'registrations', newRecord.id), newRecord);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'registrations');
    }
  };

  const handleUpdateRegistration = async (record: RegistrationRecord) => {
    try {
      await setDoc(doc(db, 'registrations', record.id), record);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'registrations');
    }
  };

  const handleDeleteRegistration = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'registrations', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'registrations');
    }
  };

  const handleAddApproval = async (record: ApprovalRecord) => {
    const newRecord = { ...record };
    if (user) {
      newRecord.authorUid = user.uid;
    }
    try {
      await setDoc(doc(db, 'approvals', newRecord.id), newRecord);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'approvals');
    }
  };

  const handleUpdateApproval = async (record: ApprovalRecord) => {
    try {
      await setDoc(doc(db, 'approvals', record.id), record);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'approvals');
    }
  };

  const handleDeleteApproval = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'approvals', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'approvals');
    }
  };

  const handleUpdateApprovalStatus = async (id: string, status: ApprovalStatus) => {
    try {
      await updateDoc(doc(db, 'approvals', id), { 
        status, 
        approvalDate: new Date().toISOString().split('T')[0] 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'approvals');
    }
  };

  const handleUpdateRegistrationStatus = async (id: string, status: '待核对' | '已核对') => {
    try {
      await updateDoc(doc(db, 'registrations', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'registrations');
    }
  };

  const handleBatchUpdateRegistrationStatus = async (ids: string[], status: '待核对' | '已核对') => {
    const batch = writeBatch(db);
    ids.forEach(id => {
      batch.update(doc(db, 'registrations', id), { status });
    });
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'registrations');
    }
  };

  const handleBatchUpdateApprovalStatus = async (ids: string[], status: ApprovalStatus) => {
    const batch = writeBatch(db);
    ids.forEach(id => {
      batch.update(doc(db, 'approvals', id), { 
        status, 
        approvalDate: new Date().toISOString().split('T')[0] 
      });
    });
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'approvals');
    }
  };

  const handleResetData = async () => {
    if (window.confirm('确定要重置数据吗？这将清除所有手动添加的记录并恢复系统默认的仪器比价信息。')) {
      const batch = writeBatch(db);
      // Delete existing projects and local items
      testProjects.forEach(p => batch.delete(doc(db, 'testProjects', p.id)));
      localItems.forEach(i => batch.delete(doc(db, 'localItems', i.id)));
      
      // Add mock data
      mockTestProjects.forEach(p => batch.set(doc(db, 'testProjects', p.id), p));
      mockLocalItems.forEach(i => batch.set(doc(db, 'localItems', i.id), i));
      
      try {
        await batch.commit();
        alert('数据已重置为系统默认值！');
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'reset');
      }
    }
  };

  const handleUpdateProject = async (updatedProject: TestProject) => {
    try {
      console.log('handleUpdateProject: Attempting to update project in Firestore:', updatedProject.id);
      await setDoc(doc(db, 'testProjects', updatedProject.id), updatedProject);
      console.log('handleUpdateProject: Successfully updated project:', updatedProject.id);
    } catch (error) {
      console.error('handleUpdateProject: Error updating project:', error);
      handleFirestoreError(error, OperationType.UPDATE, 'testProjects');
      throw error; // Ensure the error is propagated
    }
  };

  const handleAddProject = async (newProject: TestProject) => {
    try {
      console.log('handleAddProject: Attempting to add project to Firestore:', newProject.id);
      const projectRef = doc(db, 'testProjects', newProject.id);
      await setDoc(projectRef, newProject);
      console.log('handleAddProject: Successfully added project:', newProject.id);
    } catch (error) {
      console.error('handleAddProject: Error adding project:', error);
      handleFirestoreError(error, OperationType.CREATE, 'testProjects');
      throw error; // Ensure the error is propagated
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'testProjects', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'testProjects');
    }
  };

  const handleAddLocalItem = async (item: LocalPlatformItem) => {
    try {
      await setDoc(doc(db, 'localItems', item.id), item);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'localItems');
    }
  };

  const handleUpdateLocalItem = async (item: LocalPlatformItem) => {
    try {
      await setDoc(doc(db, 'localItems', item.id), item);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'localItems');
    }
  };

  const handleDeleteLocalItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'localItems', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'localItems');
    }
  };

  // Excel Export
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Prepare overview data for export (flattening if needed, but here it's simple)
    const wsOverview = XLSX.utils.json_to_sheet(testProjects);
    XLSX.utils.book_append_sheet(wb, wsOverview, "测试项目总览");

    const wsLocal = XLSX.utils.json_to_sheet(localItems);
    XLSX.utils.book_append_sheet(wb, wsLocal, "本地平台目录");

    const wsReg = XLSX.utils.json_to_sheet(registrations);
    XLSX.utils.book_append_sheet(wb, wsReg, "机构送样登记");

    const wsAppr = XLSX.utils.json_to_sheet(approvals);
    XLSX.utils.book_append_sheet(wb, wsAppr, "机构测试审批");

    XLSX.writeFile(wb, `科研测试管理系统_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Excel Import
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const sheetNames = wb.SheetNames;
      
      const batch = writeBatch(db);

      if (sheetNames.includes("测试项目总览")) {
        const rawData = XLSX.utils.sheet_to_json(wb.Sheets["测试项目总览"]) as any[];
        rawData.forEach((item, index) => {
          const id = item.id || `imported-${Date.now()}-${index}`;
          const project: TestProject = {
            id,
            name: item.name || item['测试项目'] || '',
            kuaiyicePrice: String(item.kuaiyicePrice || item['快易测价格'] || ''),
            kuaiyiceDetail: item.kuaiyiceDetail || item['快易测详情'] || '',
            compassPrice: String(item.compassPrice || item['科学指南针价格'] || ''),
            compassDetail: item.compassDetail || item['科学指南针详情'] || '',
            recommendation: item.recommendation || item['推荐外测选择'] || '',
            hkuAvailable: item.hkuAvailable === true || item['港大'] === '有' || item['HKU'] === '有' || item['hkuAvailable'] === 'true',
            cityuAvailable: item.cityuAvailable === true || item['城大'] === '有' || item['CityU'] === '有' || item['cityuAvailable'] === 'true',
            milesAvailable: item.milesAvailable === true || item['MILES'] === '有' || item['milesAvailable'] === 'true',
            mainlandAvailable: item.mainlandAvailable === true || item['内地'] === '有' || item['mainlandAvailable'] === 'true',
            remarks: item.remarks || item['备注'] || '',
          };
          batch.set(doc(db, 'testProjects', id), project);
        });
      }
      
      if (sheetNames.includes("本地平台目录")) {
        const data = XLSX.utils.sheet_to_json(wb.Sheets["本地平台目录"]) as LocalPlatformItem[];
        data.forEach((item, index) => {
          const id = item.id || `local-${Date.now()}-${index}`;
          batch.set(doc(db, 'localItems', id), { ...item, id });
        });
      }
      
      try {
        await batch.commit();
        alert('导入成功！');
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'import');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleNavigateToRegistration = (projectName: string) => {
    setPrefilledProject(projectName);
    setActiveTab('registration');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return (
        <Overview 
          data={testProjects} 
          onUpdateProject={handleUpdateProject}
          onAddProject={handleAddProject}
          onDeleteProject={handleDeleteProject}
          onNavigateToRegistration={handleNavigateToRegistration}
          isAdmin={isAdmin}
          isAuthenticated={!!user}
        />
      );
      case 'local': return (
        <LocalDirectory 
          data={localItems} 
          onAdd={handleAddLocalItem}
          onUpdate={handleUpdateLocalItem}
          onDelete={handleDeleteLocalItem}
          isAdmin={isAdmin}
          isAuthenticated={!!user}
        />
      );
      case 'registration': return (
        <Registration 
          data={registrations} 
          onAdd={handleAddRegistration} 
          onUpdate={handleUpdateRegistration}
          onDelete={handleDeleteRegistration}
          onUpdateStatus={handleUpdateRegistrationStatus}
          onBatchUpdateStatus={handleBatchUpdateRegistrationStatus}
          onSwitchToApproval={() => setActiveTab('approval')}
          isAdmin={isAdmin}
          user={user}
          prefilledProject={prefilledProject}
          clearPrefill={() => setPrefilledProject(null)}
        />
      );
      case 'approval': return (
        <Approval 
          data={approvals} 
          onAdd={handleAddApproval} 
          onUpdate={handleUpdateApproval}
          onDelete={handleDeleteApproval}
          onUpdateStatus={handleUpdateApprovalStatus}
          onBatchUpdateStatus={handleBatchUpdateApprovalStatus}
          isAdmin={isAdmin}
          user={user}
        />
      );
      case 'rules': return <Rules />;
      default: return (
        <Overview 
          data={testProjects} 
          onUpdateProject={handleUpdateProject}
          onAddProject={handleAddProject}
          onDeleteProject={handleDeleteProject}
          onNavigateToRegistration={handleNavigateToRegistration}
          isAdmin={isAdmin}
          isAuthenticated={!!user}
        />
      );
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'overview': return '测试项目总览';
      case 'local': return '本地平台目录';
      case 'registration': return '机构送样登记表';
      case 'approval': return '机构测试审批表';
      case 'rules': return '规则说明';
      default: return '';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 md:relative md:flex transition-transform duration-300",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }} 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
        />
      </div>
      
      <main className="flex-1 flex flex-col min-w-0 w-full">
        <header className="h-auto md:h-16 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between px-4 md:px-8 py-4 md:py-0 sticky top-0 z-10 gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden p-1" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">{getTitle()}</h1>
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                    <div className="hidden sm:block text-xs">
                      <div className="font-medium text-slate-900">{user.displayName}</div>
                      <div className="text-slate-500">{isAdmin ? '管理员' : '普通用户'}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={logout} className="text-slate-400 hover:text-red-600 p-1">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={loginWithGoogle} className="flex items-center gap-2 text-xs">
                  <LogIn className="w-4 h-4" /> 登录
                </Button>
              )}
            </div>
            {activeTab === 'overview' && (
              <div className="hidden lg:flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                  <div className="w-3 h-3 rounded bg-[#FEF9C3] border border-[#FDE047]"></div>
                  <span>HKU</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                  <div className="w-3 h-3 rounded bg-[#FCE7F3] border border-[#F9A8D4]"></div>
                  <span>CityU</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                  <div className="w-3 h-3 rounded bg-[#DBEAFE] border border-[#93C5FD]"></div>
                  <span>MILES</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                  <div className="w-3 h-3 rounded bg-[#CCFBF1] border border-[#5EEAD4]"></div>
                  <span>内地</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <Button variant="ghost" size="sm" onClick={handleResetData} className="text-slate-400 hover:text-amber-600 flex items-center gap-2 text-xs md:text-sm">
              <RotateCcw className="w-3 h-3 md:w-4 md:h-4" /> 重置数据
            </Button>
            <div className="hidden md:block w-px h-6 bg-slate-200 mx-1" />
            <label className="cursor-pointer">
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
              <Button variant="outline" size="sm" className="flex items-center gap-2 text-xs md:text-sm">
                <Upload className="w-3 h-3 md:w-4 md:h-4" /> 导入 Excel
              </Button>
            </label>
            <Button variant="outline" size="sm" onClick={exportToExcel} className="flex items-center gap-2 text-xs md:text-sm">
              <Download className="w-3 h-3 md:w-4 md:h-4" /> 导出 Excel
            </Button>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'overview' && (
            <div className="lg:hidden flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                <div className="w-3 h-3 rounded bg-[#FEF9C3] border border-[#FDE047]"></div>
                <span>HKU</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                <div className="w-3 h-3 rounded bg-[#FCE7F3] border border-[#F9A8D4]"></div>
                <span>CityU</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                <div className="w-3 h-3 rounded bg-[#DBEAFE] border border-[#93C5FD]"></div>
                <span>MILES</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                <div className="w-3 h-3 rounded bg-[#CCFBF1] border border-[#5EEAD4]"></div>
                <span>内地</span>
              </div>
            </div>
          )}
          <div className="w-full overflow-x-auto">
            {renderContent()}
          </div>
        </div>

        <footer className="mt-auto p-4 md:p-8 border-t border-slate-200 bg-white text-center text-xs md:text-sm text-slate-400">
          <div className="space-y-1">
            <div className="font-medium text-slate-500">ZHI Group</div>
            <div>测试表征管理系统 &copy; {new Date().getFullYear()} · 内部使用</div>
          </div>
        </footer>
      </main>
    </div>
  );
}
