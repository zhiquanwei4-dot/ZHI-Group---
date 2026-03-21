import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Info, Trash2, Search, ExternalLink, CheckCircle2, XCircle, Clock, LogIn, LogOut, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { ApprovalRecord, approvalSchema, Region, QuoteType, ApprovalStatus } from '../types';
import { Card, Button, Badge } from './UI';
import { cn, formatCurrency, getStatusColor } from '../lib/utils';
import { CHECK_PASSWORD } from '../constants';

interface ApprovalProps {
  data: ApprovalRecord[];
  onAdd: (record: ApprovalRecord) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: ApprovalStatus) => void;
  onBatchUpdateStatus: (ids: string[], status: ApprovalStatus) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

export function Approval({ 
  data, 
  onAdd, 
  onDelete, 
  onUpdateStatus, 
  onBatchUpdateStatus,
  isAdmin,
  setIsAdmin 
}: ApprovalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pendingAction, setPendingAction] = useState<{ id: string, status: ApprovalStatus } | null>(null);
  const [isBatchAction, setIsBatchAction] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      applicant: '',
      region: '香港' as Region,
      sampleName: '',
      testProject: '',
      institution: '快易测' as const,
      quoteType: '按样' as QuoteType,
      unitPrice: 0,
      sampleCount: 1,
      corePurpose: '',
      reasonForExternal: '',
      quoteLink: '',
    }
  });

  const unitPrice = watch('unitPrice') || 0;
  const sampleCount = watch('sampleCount') || 1;
  const totalPrice = unitPrice * sampleCount;

  const onSubmit = (formData: any) => {
    const newRecord: ApprovalRecord = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      totalPrice,
      status: '待审批',
    };
    onAdd(newRecord);
    setIsAdding(false);
    reset();
  };

  const filteredData = data.filter(item => 
    item.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.testProject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sampleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusClick = (id: string, status: ApprovalStatus) => {
    if (isAdmin) {
      onUpdateStatus(id, status);
      return;
    }
    setPendingAction({ id, status });
    setIsBatchAction(false);
    setShowPasswordModal(true);
    setPasswordInput('');
    setPasswordError('');
  };

  const confirmPassword = () => {
    if (passwordInput === CHECK_PASSWORD) {
      if (pendingAction) {
        onUpdateStatus(pendingAction.id, pendingAction.status);
      } else if (isBatchAction) {
        onBatchUpdateStatus(selectedIds, '通过');
        setSelectedIds([]);
      } else {
        // This was a login action
        setIsAdmin(true);
      }
      setShowPasswordModal(false);
      setPendingAction(null);
      setIsBatchAction(false);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('密码错误，请重试');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredData.map(r => r.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchApprove = () => {
    if (!isAdmin) {
      setIsBatchAction(true);
      setShowPasswordModal(true);
      return;
    }
    onBatchUpdateStatus(selectedIds, '通过');
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-amber-50 border-amber-100">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 leading-relaxed">
            <p className="font-bold mb-1">适用情形：</p>
            机构测试单项预计总价 <span className="font-bold text-red-600">&gt; 2000 元</span>，需在下单前完成审批。建议附报价截图/报价链接，并说明该测试拟回答的核心问题；仅当本地平台无法满足时方可申请。
            <br />
            <span className="font-medium">须先填写本表并完成审批，审批通过后方可下单送样；原则上不得先测试后补审批。</span>
          </div>
        </div>
      </Card>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索审批记录..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <Button 
              variant="secondary" 
              onClick={handleBatchApprove}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> 批量通过 ({selectedIds.length})
            </Button>
          )}
          <Button 
            variant={isAdmin ? "outline" : "secondary"} 
            onClick={() => isAdmin ? setIsAdmin(false) : setShowPasswordModal(true)}
            className="flex items-center gap-2"
          >
            {isAdmin ? (
              <><LogOut className="w-4 h-4" /> 退出登录</>
            ) : (
              <><LogIn className="w-4 h-4" /> 管理员登录</>
            )}
          </Button>
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> 提交新审批
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card title="提交机构测试审批" className="border-amber-200 ring-1 ring-amber-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">申请人</label>
                <input {...register('applicant')} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                {errors.applicant && <p className="text-xs text-red-500">{errors.applicant.message as string}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">所属地区</label>
                <select {...register('region')} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="香港">香港</option>
                  <option value="MILES">MILES</option>
                  <option value="内地">内地</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">样品名称/编号</label>
                <input {...register('sampleName')} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                {errors.sampleName && <p className="text-xs text-red-500">{errors.sampleName.message as string}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">测试项目</label>
                <input {...register('testProject')} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                {errors.testProject && <p className="text-xs text-red-500">{errors.testProject.message as string}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">拟送机构</label>
                <select {...register('institution')} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="快易测">快易测</option>
                  <option value="科学指南针">科学指南针</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">报价类型</label>
                <select {...register('quoteType')} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="按样">按样</option>
                  <option value="按小时">按小时</option>
                  <option value="按次">按次</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">单价/报价 (RMB)</label>
                <input type="number" {...register('unitPrice', { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                {errors.unitPrice && <p className="text-xs text-red-500">{errors.unitPrice.message as string}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">样品数量/机时</label>
                <input type="number" {...register('sampleCount', { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                {errors.sampleCount && <p className="text-xs text-red-500">{errors.sampleCount.message as string}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">报价链接 (可选)</label>
                <input {...register('quoteLink')} placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">核心目的/需回答问题</label>
                <textarea {...register('corePurpose')} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
                {errors.corePurpose && <p className="text-xs text-red-500">{errors.corePurpose.message as string}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">为何必须外测 (本地平台无法满足的原因)</label>
                <textarea {...register('reasonForExternal')} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
                {errors.reasonForExternal && <p className="text-xs text-red-500">{errors.reasonForExternal.message as string}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">预计总价:</span>
                <span className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>取消</Button>
                <Button type="submit">提交审批</Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      <div className="flex items-center justify-between mb-2">
        <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          {selectedIds.length === filteredData.length && filteredData.length > 0 ? (
            <CheckSquare className="w-4 h-4 text-indigo-600" />
          ) : (
            <Square className="w-4 h-4 text-slate-300" />
          )}
          全选 / 取消全选
        </button>
        <div className="text-xs text-slate-400">共 {filteredData.length} 条记录</div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredData.map(record => (
          <Card key={record.id} className={cn("p-0 transition-all", selectedIds.includes(record.id) && "ring-2 ring-indigo-500 ring-offset-2")}>
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                  <button onClick={() => toggleSelect(record.id)} className="mt-1 focus:outline-none">
                    {selectedIds.includes(record.id) ? (
                      <CheckSquare className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300" />
                    )}
                  </button>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-bold text-slate-900">{record.testProject}</h4>
                      <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                    </div>
                    <div className="text-sm text-slate-500">
                      申请人: <span className="text-slate-700 font-medium">{record.applicant}</span> ({record.region}) | 
                      日期: <span className="text-slate-700 font-medium">{record.date}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">{formatCurrency(record.totalPrice)}</div>
                  <div className="text-xs text-slate-400">{record.institution} · {record.unitPrice}/{record.quoteType} · {record.sampleCount}个</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2">核心目的</div>
                  <p className="text-sm text-slate-700 leading-relaxed">{record.corePurpose}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2">外测原因</div>
                  <p className="text-sm text-slate-700 leading-relaxed">{record.reasonForExternal}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  {record.quoteLink && (
                    <a 
                      href={record.quoteLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      <ExternalLink className="w-4 h-4" /> 查看报价
                    </a>
                  )}
                  {record.approvalRemarks && (
                    <div className="text-sm text-slate-500 italic">
                      审批意见: {record.approvalRemarks}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {record.status === '待审批' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleStatusClick(record.id, '通过')} className="text-green-600 hover:bg-green-50 border-green-200">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> 通过
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleStatusClick(record.id, '驳回')} className="text-red-600 hover:bg-red-50 border-red-200">
                        <XCircle className="w-4 h-4 mr-1.5" /> 驳回
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => onDelete(record.id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {filteredData.length === 0 && (
          <div className="py-20 text-center bg-white rounded-xl border border-slate-200 border-dashed">
            <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 italic">暂无审批记录</p>
          </div>
        )}
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200" title={pendingAction || isBatchAction ? "管理员审批确认" : "管理员登录"}>
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                {pendingAction || isBatchAction ? "请输入管理员密码以执行此操作：" : "请输入管理员密码以开启管理模式："}
              </p>
              <div className="space-y-2">
                <input
                  type="password"
                  autoFocus
                  className={cn(
                    "w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                    passwordError ? "border-red-500 bg-red-50" : "border-slate-200"
                  )}
                  placeholder="请输入密码"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmPassword();
                    if (e.key === 'Escape') setShowPasswordModal(false);
                  }}
                />
                {passwordError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {passwordError}
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPendingAction(null);
                    setIsBatchAction(false);
                    setPasswordInput('');
                    setPasswordError('');
                  }}
                >
                  取消
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={confirmPassword}
                >
                  确认
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
