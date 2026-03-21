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
  ApprovalStatus
} from './types';
import { mockTestProjects, mockLocalItems } from './constants';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State
  const [testProjects, setTestProjects] = useState<TestProject[]>([]);
  const [localItems, setLocalItems] = useState<LocalPlatformItem[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('testProjects_v5');
    const savedLocal = localStorage.getItem('localItems_v5');
    const savedRegistrations = localStorage.getItem('registrations_v5');
    const savedApprovals = localStorage.getItem('approvals_v5');

    setTestProjects(savedProjects ? JSON.parse(savedProjects) : mockTestProjects);
    setLocalItems(savedLocal ? JSON.parse(savedLocal) : mockLocalItems);
    setRegistrations(savedRegistrations ? JSON.parse(savedRegistrations) : []);
    setApprovals(savedApprovals ? JSON.parse(savedApprovals) : []);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (testProjects.length > 0) localStorage.setItem('testProjects_v5', JSON.stringify(testProjects));
    if (localItems.length > 0) localStorage.setItem('localItems_v5', JSON.stringify(localItems));
    localStorage.setItem('registrations_v5', JSON.stringify(registrations));
    localStorage.setItem('approvals_v5', JSON.stringify(approvals));
  }, [testProjects, localItems, registrations, approvals]);

  // Handlers
  const handleAddRegistration = (record: RegistrationRecord) => {
    setRegistrations([record, ...registrations]);
  };

  const handleDeleteRegistration = (id: string) => {
    setRegistrations(registrations.filter(r => r.id !== id));
  };

  const handleAddApproval = (record: ApprovalRecord) => {
    setApprovals([record, ...approvals]);
  };

  const handleDeleteApproval = (id: string) => {
    setApprovals(approvals.filter(a => a.id !== id));
  };

  const handleUpdateApprovalStatus = (id: string, status: ApprovalStatus) => {
    setApprovals(approvals.map(a => a.id === id ? { 
      ...a, 
      status, 
      approvalDate: new Date().toISOString().split('T')[0] 
    } : a));
  };

  const handleUpdateRegistrationStatus = (id: string, status: '待核对' | '已核对') => {
    setRegistrations(registrations.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleBatchUpdateRegistrationStatus = (ids: string[], status: '待核对' | '已核对') => {
    setRegistrations(registrations.map(r => ids.includes(r.id) ? { ...r, status } : r));
  };

  const handleBatchUpdateApprovalStatus = (ids: string[], status: ApprovalStatus) => {
    setApprovals(approvals.map(a => ids.includes(a.id) ? { 
      ...a, 
      status, 
      approvalDate: new Date().toISOString().split('T')[0] 
    } : a));
  };

  const handleResetData = () => {
    if (window.confirm('确定要重置数据吗？这将清除所有手动添加的记录并恢复系统默认的仪器比价信息。')) {
      localStorage.removeItem('testProjects_v5');
      localStorage.removeItem('localItems_v5');
      setTestProjects(mockTestProjects);
      setLocalItems(mockLocalItems);
      alert('数据已重置为系统默认值！');
    }
  };

  const handleUpdateProject = (updatedProject: TestProject) => {
    const newData = testProjects.map(p => p.id === updatedProject.id ? updatedProject : p);
    setTestProjects(newData);
  };

  const handleAddProject = (newProject: TestProject) => {
    setTestProjects([newProject, ...testProjects]);
  };

  const handleDeleteProject = (id: string) => {
    setTestProjects(testProjects.filter(p => p.id !== id));
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
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const sheetNames = wb.SheetNames;
      
      if (sheetNames.includes("测试项目总览")) {
        const rawData = XLSX.utils.sheet_to_json(wb.Sheets["测试项目总览"]) as any[];
        const importedProjects: TestProject[] = rawData.map((item, index) => ({
          id: item.id || `imported-${Date.now()}-${index}`,
          name: item.name || item['测试项目'] || '',
          kuaiyicePrice: String(item.kuaiyicePrice || item['快易测价格'] || ''),
          kuaiyiceDetail: item.kuaiyiceDetail || item['快易测详情'] || '',
          compassPrice: String(item.compassPrice || item['科学指南针价格'] || ''),
          compassDetail: item.compassDetail || item['科学指南针详情'] || '',
          recommendation: item.recommendation || item['推荐外测选择'] || '',
          hkuAvailable: item.hkuAvailable === true || item['港大'] === '有' || item['hkuAvailable'] === 'true',
          cityuAvailable: item.cityuAvailable === true || item['城大'] === '有' || item['cityuAvailable'] === 'true',
          milesAvailable: item.milesAvailable === true || item['MILES'] === '有' || item['milesAvailable'] === 'true',
          mainlandAvailable: item.mainlandAvailable === true || item['内地'] === '有' || item['mainlandAvailable'] === 'true',
          remarks: item.remarks || item['备注'] || '',
        }));
        setTestProjects([...importedProjects, ...testProjects]);
      }
      
      if (sheetNames.includes("本地平台目录")) {
        const data = XLSX.utils.sheet_to_json(wb.Sheets["本地平台目录"]) as LocalPlatformItem[];
        setLocalItems([...data, ...localItems]);
      }
      
      alert('导入成功！');
    };
    reader.readAsBinaryString(file);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return (
        <Overview 
          data={testProjects} 
          onUpdateProject={handleUpdateProject}
          onAddProject={handleAddProject}
          onDeleteProject={handleDeleteProject}
        />
      );
      case 'local': return <LocalDirectory data={localItems} />;
      case 'registration': return (
        <Registration 
          data={registrations} 
          onAdd={handleAddRegistration} 
          onDelete={handleDeleteRegistration}
          onUpdateStatus={handleUpdateRegistrationStatus}
          onBatchUpdateStatus={handleBatchUpdateRegistrationStatus}
          onSwitchToApproval={() => setActiveTab('approval')}
          isAdmin={isAdmin}
          setIsAdmin={setIsAdmin}
        />
      );
      case 'approval': return (
        <Approval 
          data={approvals} 
          onAdd={handleAddApproval} 
          onDelete={handleDeleteApproval}
          onUpdateStatus={handleUpdateApprovalStatus}
          onBatchUpdateStatus={handleBatchUpdateApprovalStatus}
          isAdmin={isAdmin}
          setIsAdmin={setIsAdmin}
        />
      );
      case 'rules': return <Rules />;
      default: return (
        <Overview 
          data={testProjects} 
          onUpdateProject={handleUpdateProject}
          onAddProject={handleAddProject}
          onDeleteProject={handleDeleteProject}
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
