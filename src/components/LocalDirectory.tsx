import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Search, ExternalLink, Plus, Edit2, X } from 'lucide-react';
import { LocalPlatformItem, Platform } from '../types';
import { Card, Button } from './UI';
import { cn } from '../lib/utils';
import { PLATFORM_URLS } from '../constants';

interface LocalDirectoryProps {
  data: LocalPlatformItem[];
  onAdd: (item: LocalPlatformItem) => void;
  onUpdate: (item: LocalPlatformItem) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const platforms: Platform[] = ['ME', 'CHEM', '生命科学系', 'UCF', 'MILES', 'CityU'];

export function LocalDirectory({ data, onAdd, onUpdate, onDelete, isAdmin, isAuthenticated }: LocalDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<Platform>>(new Set(platforms));
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<LocalPlatformItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const togglePlatform = (platform: Platform) => {
    const next = new Set(expandedPlatforms);
    if (next.has(platform)) {
      next.delete(platform);
    } else {
      next.add(platform);
    }
    setExpandedPlatforms(next);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter(item => 
      item.name.toLowerCase().includes(lower) || 
      item.instrumentName.toLowerCase().includes(lower)
    );
  }, [data, searchTerm]);

  const handleSaveItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const itemData: LocalPlatformItem = {
        id: editingItem?.id || `local-${Date.now()}`,
        name: formData.get('name') as string,
        platform: formData.get('platform') as Platform,
        instrumentName: formData.get('instrumentName') as string,
        hkuUserFee: formData.get('hkuUserFee') as string,
        billingMethod: formData.get('billingMethod') as string,
        remarks: formData.get('remarks') as string,
      };

      if (isAdding) {
        await onAdd(itemData);
      } else {
        await onUpdate(itemData);
      }
      alert('保存成功');
      setEditingItem(null);
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to save item:', error);
      alert('保存失败，请检查权限或网络连接');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索测试项目或设备名..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => { setIsAdding(true); setEditingItem({} as LocalPlatformItem); }} className="gap-2">
          <Plus size={18} />
          <span>新增项目</span>
        </Button>
      </div>

      <div className="space-y-4">
        {platforms.map(platform => {
          const platformItems = filteredData.filter(item => item.platform === platform);
          if (searchTerm && platformItems.length === 0) return null;
          
          const isExpanded = expandedPlatforms.has(platform);

          return (
            <Card key={platform} className="p-0 overflow-hidden">
              <div className="flex items-center bg-slate-50 border-b border-slate-200 pr-4">
                <button
                  onClick={() => togglePlatform(platform)}
                  className="flex-1 px-6 py-4 flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{platform}</span>
                    <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      {platformItems.length} 个项目
                    </span>
                  </div>
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                </button>
                {PLATFORM_URLS[platform] && (
                  <a 
                    href={PLATFORM_URLS[platform]} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors ml-2"
                  >
                    <span>访问主页</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>

              {isExpanded && (
                <div className="overflow-hidden">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white border-b border-slate-100">
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">测试项目</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">仪器/设备名称</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center">HKU user 费用</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center">计费方式</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">备注</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {platformItems.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{item.instrumentName}</td>
                            <td className="px-6 py-4 text-sm text-indigo-600 font-medium text-center">{item.hkuUserFee}</td>
                            <td className="px-6 py-4 text-sm text-slate-500 text-center">{item.billingMethod}</td>
                            <td className="px-6 py-4 text-sm text-slate-400 italic">{item.remarks}</td>
                            <td className="px-6 py-4 text-sm text-center">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setEditingItem(item)}
                                className="text-slate-400 hover:text-indigo-600"
                              >
                                <Edit2 size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-slate-50 bg-white">
                    {platformItems.map(item => (
                      <div key={item.id} className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setEditingItem(item)}
                            className="text-slate-400 p-1 h-auto"
                          >
                            <Edit2 size={16} />
                          </Button>
                        </div>
                        <div className="text-xs text-slate-500">{item.instrumentName}</div>
                        <div className="flex items-center justify-between pt-1">
                          <div className="text-xs font-medium text-indigo-600">{item.hkuUserFee} / {item.billingMethod}</div>
                          {item.remarks && <div className="text-[10px] text-slate-400 italic">{item.remarks}</div>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {platformItems.length === 0 && (
                    <div className="px-6 py-8 text-center text-slate-400 italic bg-white">
                      该分类下暂无匹配项目
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Edit/Add Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => { setEditingItem(null); setIsAdding(false); }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold text-slate-900 mb-6">
              {isAdding ? '新增本地平台项目' : '编辑本地平台项目'}
            </h3>
            
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase">测试项目</label>
                <input name="name" defaultValue={editingItem.name} required className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase">所属平台</label>
                <select name="platform" defaultValue={editingItem.platform || 'ME'} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
                  {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase">仪器/设备名称</label>
                <input name="instrumentName" defaultValue={editingItem.instrumentName} required className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 uppercase">HKU user 费用</label>
                  <input name="hkuUserFee" defaultValue={editingItem.hkuUserFee} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 uppercase">计费方式</label>
                  <input name="billingMethod" defaultValue={editingItem.billingMethod} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase">备注</label>
                <textarea name="remarks" defaultValue={editingItem.remarks} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none" />
              </div>

              <div className="mt-8 flex justify-between gap-3">
                {!isAdding && isAdmin && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="text-rose-500 hover:bg-rose-50"
                    onClick={() => {
                      if (confirm('确定要删除此项目吗？')) {
                        onDelete(editingItem.id);
                        setEditingItem(null);
                      }
                    }}
                  >
                    删除项目
                  </Button>
                )}
                <div className="flex gap-3 ml-auto">
                  <Button type="button" variant="ghost" onClick={() => { setEditingItem(null); setIsAdding(false); }} disabled={isSaving}>取消</Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? '保存中...' : '保存更改'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
