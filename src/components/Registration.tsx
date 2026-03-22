import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, AlertCircle, Info, Trash2, Search, Edit } from 'lucide-react';
import { RegistrationRecord, registrationSchema, Region, QuoteType } from '../types';
import { Card, Button, Badge } from './UI';
import { cn, formatCurrency, getStatusColor } from '../lib/utils';
import { CheckSquare, Square, LogIn } from 'lucide-react';
import { loginWithGoogle } from '../firebase';

interface RegistrationProps {
  data: RegistrationRecord[];
  onAdd: (record: RegistrationRecord) => void;
  onUpdate: (record: RegistrationRecord) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: '待核对' | '已核对') => void;
  onBatchUpdateStatus: (ids: string[], status: '待核对' | '已核对') => void;
  onSwitchToApproval: () => void;
  isAdmin: boolean;
  user: any;
  prefilledProject?: string | null;
  clearPrefill?: () => void;
}

export function Registration({ 
  data, 
  onAdd, 
  onUpdate,
  onDelete, 
  onUpdateStatus, 
  onBatchUpdateStatus,
  onSwitchToApproval,
  isAdmin,
  user,
  prefilledProject,
  clearPrefill
}: RegistrationProps) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingRecord, setEditingRecord] = React.useState<RegistrationRecord | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Selection State
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      applicant: '',
      region: 'HKU' as Region,
      sampleName: '',
      testProject: '',
      sampleCount: 1,
      checkedPlatforms: '',
      reason: '',
      institution: '快易测' as const,
      quoteType: '按样' as QuoteType,
      unitPrice: 0,
      orderNumber: '',
      status: '待核对' as const,
    }
  });

  // Handle pre-filled project
  React.useEffect(() => {
    if (prefilledProject) {
      setIsAdding(true);
      setValue('testProject', prefilledProject);
      if (clearPrefill) clearPrefill();
    }
  }, [prefilledProject, setValue, clearPrefill]);

  const unitPrice = watch('unitPrice') || 0;
  const sampleCount = watch('sampleCount') || 1;
  const totalPrice = unitPrice * sampleCount;
  const needsApproval = totalPrice > 2000;

  const onSubmit = (formData: any) => {
    if (needsApproval) return;
    
    if (editingRecord) {
      const updatedRecord: RegistrationRecord = {
        ...editingRecord,
        ...formData,
        totalPrice,
      };
      onUpdate(updatedRecord);
    } else {
      const newRecord: RegistrationRecord = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0],
        totalPrice,
        status: '待核对',
      };
      onAdd(newRecord);
    }
    setIsAdding(false);
    setEditingRecord(null);
    reset();
  };

  const handleEdit = (record: RegistrationRecord) => {
    setEditingRecord(record);
    setIsAdding(true);
    reset({
      applicant: record.applicant,
      region: record.region,
      sampleName: record.sampleName,
      testProject: record.testProject,
      sampleCount: record.sampleCount,
      checkedPlatforms: record.checkedPlatforms,
      reason: record.reason,
      institution: record.institution,
      quoteType: record.quoteType,
      unitPrice: record.unitPrice,
      orderNumber: record.orderNumber,
      status: record.status,
    });
  };

  const filteredData = data.filter(item => 
    item.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.testProject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sampleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusClick = (id: string, currentStatus: '待核对' | '已核对') => {
    if (isAdmin) {
      onUpdateStatus(id, currentStatus === '待核对' ? '已核对' : '待核对');
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

  const handleBatchCheck = () => {
    if (isAdmin) {
      onBatchUpdateStatus(selectedIds, '已核对');
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-100">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 leading-relaxed">
            <p className="font-bold mb-1">适用情形：</p>
            当地平台（HKU/CityU/MILES/内地）没有该测试项目，或当前无可用设备/权限/预约条件，方可申请机构送样。填写时请先核查本地平台并说明原因；若预计总价超过 2000 元，请转移填写《机构测试审批表》。
            <br />
            <span className="font-medium">单项预计费用在 2000 元以下的机构测试，可不等待审核，填写本表后即可先通过平台下单送样。</span>
          </div>
        </div>
      </Card>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索登记记录..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && isAdmin && (
            <Button 
              variant="secondary" 
              onClick={handleBatchCheck}
              className="flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" /> 批量核对 ({selectedIds.length})
            </Button>
          )}
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> 新增登记
          </Button>
          {!user && (
            <Button variant="ghost" onClick={loginWithGoogle} className="flex items-center gap-2 text-slate-500">
              <LogIn className="w-4 h-4" /> 管理员登录
            </Button>
          )}
        </div>
      </div>

      {isAdding && (
        <Card title={editingRecord ? "编辑送样登记" : "新增机构送样登记"} className="border-indigo-200 ring-1 ring-indigo-100">
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
                  <option value="HKU">HKU</option>
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
                <label className="text-sm font-medium text-slate-700">样品数量</label>
                <input type="number" {...register('sampleCount', { valueAsNumber: true })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                {errors.sampleCount && <p className="text-xs text-red-500">{errors.sampleCount.message as string}</p>}
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
                <label className="text-sm font-medium text-slate-700">平台订单号 (可选)</label>
                <input {...register('orderNumber')} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              {isAdmin && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">核对状态</label>
                  <select {...register('status')} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="待核对">待核对</option>
                    <option value="已核对">已核对</option>
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">本地已核查平台</label>
                <input {...register('checkedPlatforms')} placeholder="如：HKU ME, CityU" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                {errors.checkedPlatforms && <p className="text-xs text-red-500">{errors.checkedPlatforms.message as string}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">本地不可测原因</label>
                <input {...register('reason')} placeholder="如：设备维护中，无此功能" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                {errors.reason && <p className="text-xs text-red-500">{errors.reason.message as string}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">预计总价:</span>
                <span className={cn("text-2xl font-bold", needsApproval ? "text-red-600" : "text-indigo-600")}>
                  {formatCurrency(totalPrice)}
                </span>
                {needsApproval && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100 animate-pulse">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-bold">需审批</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => {
                  setIsAdding(false);
                  setEditingRecord(null);
                  reset();
                }}>取消</Button>
                {needsApproval ? (
                  <Button type="button" variant="danger" onClick={onSwitchToApproval}>转填审批表</Button>
                ) : (
                  <Button type="submit">{editingRecord ? '保存修改' : '提交登记'}</Button>
                )}
              </div>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase w-10">
                  <button onClick={toggleSelectAll} className="focus:outline-none">
                    {selectedIds.length === filteredData.length && filteredData.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">日期</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">申请人</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">项目/样品</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">机构/报价</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">总价</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">状态</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map(record => (
                <tr key={record.id} className={cn("hover:bg-slate-50/50 transition-colors", selectedIds.includes(record.id) && "bg-indigo-50/30")}>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleSelect(record.id)} className="focus:outline-none">
                      {selectedIds.includes(record.id) ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{record.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {record.applicant}
                    <div className="text-xs text-slate-400 font-normal">{record.region}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-slate-800">{record.testProject}</div>
                    <div className="text-xs text-slate-500">{record.sampleName} ({record.sampleCount}个)</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="text-slate-700">{record.institution}</div>
                    <div className="text-xs text-slate-500">{record.unitPrice}/{record.quoteType}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatCurrency(record.totalPrice)}</td>
                  <td className="px-6 py-4 text-sm">
                  <button 
                    onClick={() => handleStatusClick(record.id, record.status)}
                    className={cn("focus:outline-none", !isAdmin && "cursor-default")}
                    title={isAdmin ? "点击切换核对状态" : ""}
                  >
                    <Badge className={cn(getStatusColor(record.status), isAdmin && "cursor-pointer hover:opacity-80 transition-opacity")}>
                      {record.status}
                    </Badge>
                  </button>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(record)}
                        className="text-indigo-400 hover:text-indigo-600 transition-colors"
                        title="编辑记录"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => onDelete(record.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="删除记录"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 italic">
                    暂无登记记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredData.map(record => (
            <div key={record.id} className={cn("p-4 space-y-3", selectedIds.includes(record.id) && "bg-indigo-50/30")}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleSelect(record.id)} className="mt-1 focus:outline-none">
                    {selectedIds.includes(record.id) ? (
                      <CheckSquare className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300" />
                    )}
                  </button>
                  <div>
                    <h4 className="font-bold text-slate-900">{record.testProject}</h4>
                    <div className="text-xs text-slate-500">{record.sampleName} ({record.sampleCount}个)</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-indigo-600">{formatCurrency(record.totalPrice)}</div>
                  <div className="text-[10px] text-slate-400">{record.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">申请人:</span> {record.applicant} ({record.region})
                </div>
                <div>
                  <span className="text-slate-400">机构:</span> {record.institution}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button 
                  onClick={() => handleStatusClick(record.id, record.status)}
                  className={cn("focus:outline-none", !isAdmin && "cursor-default")}
                >
                  <Badge className={cn(getStatusColor(record.status), "text-[10px]")}>
                    {record.status}
                  </Badge>
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => onDelete(record.id)}
                    className="text-red-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredData.length === 0 && (
            <div className="p-8 text-center text-slate-400 italic">
              暂无登记记录
            </div>
          )}
        </div>
      </Card>

      {/* Removed Password Modal */}
    </div>
  );
}
