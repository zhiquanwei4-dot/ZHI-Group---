import React, { useState, useMemo } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getFilteredRowModel, 
  getSortedRowModel, 
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import { Search, ArrowUpDown, Check, X, Plus, Edit2, Info, ExternalLink } from 'lucide-react';
import { TestProject } from '../types';
import { Card, Badge, Button } from './UI';
import { cn } from '../lib/utils';

interface OverviewProps {
  data: TestProject[];
  onUpdateProject: (project: TestProject) => void;
  onAddProject: (project: TestProject) => void;
  onDeleteProject: (id: string) => void;
  onNavigateToRegistration: (projectName: string) => void;
}

const columnHelper = createColumnHelper<TestProject>();

export function Overview({ data, onUpdateProject, onAddProject, onDeleteProject, onNavigateToRegistration }: OverviewProps) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [localOnly, setLocalOnly] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<{ title: string; content: string } | null>(null);
  const [editingProject, setEditingProject] = useState<TestProject | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: '测试项目',
      cell: info => (
        <button 
          onClick={() => onNavigateToRegistration(info.getValue())}
          className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline text-left transition-colors"
          title="点击去送样登记"
        >
          {info.getValue()}
        </button>
      ),
    }),
    columnHelper.accessor('kuaiyicePrice', {
      header: '快易测价格',
      cell: info => {
        const project = info.row.original;
        return (
          <div 
            className={cn(
              "flex items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors",
              project.kuaiyiceDetail && "underline decoration-dotted"
            )}
            onClick={() => project.kuaiyiceDetail && setSelectedDetail({ title: `${project.name} - 快易测详情`, content: project.kuaiyiceDetail })}
          >
            <span>{info.getValue()}</span>
            {project.kuaiyiceDetail && <Info size={14} className="text-slate-400" />}
          </div>
        );
      },
    }),
    columnHelper.accessor('compassPrice', {
      header: '科学指南针价格',
      cell: info => {
        const project = info.row.original;
        return (
          <div 
            className={cn(
              "flex items-center gap-1 cursor-pointer hover:text-indigo-600 transition-colors",
              project.compassDetail && "underline decoration-dotted"
            )}
            onClick={() => project.compassDetail && setSelectedDetail({ title: `${project.name} - 科学指南针详情`, content: project.compassDetail })}
          >
            <span>{info.getValue()}</span>
            {project.compassDetail && <Info size={14} className="text-slate-400" />}
          </div>
        );
      },
    }),
    columnHelper.accessor('recommendation', {
      header: '推荐外测选择',
      cell: info => <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">{info.getValue()}</Badge>,
    }),
    columnHelper.accessor('hkuAvailable', {
      header: 'HKU',
      cell: info => info.getValue() ? (
        <div className="w-8 h-8 rounded bg-[#FEF9C3] flex items-center justify-center border border-[#FDE047] mx-auto">
          <Check className="w-4 h-4 text-[#854D0E]" />
        </div>
      ) : <X className="w-4 h-4 text-slate-300 mx-auto" />,
    }),
    columnHelper.accessor('cityuAvailable', {
      header: 'CityU',
      cell: info => info.getValue() ? (
        <div className="w-8 h-8 rounded bg-[#FCE7F3] flex items-center justify-center border border-[#F9A8D4] mx-auto">
          <Check className="w-4 h-4 text-[#9D174D]" />
        </div>
      ) : <X className="w-4 h-4 text-slate-300 mx-auto" />,
    }),
    columnHelper.accessor('milesAvailable', {
      header: 'MILES',
      cell: info => info.getValue() ? (
        <div className="w-8 h-8 rounded bg-[#DBEAFE] flex items-center justify-center border border-[#93C5FD] mx-auto">
          <Check className="w-4 h-4 text-[#1E40AF]" />
        </div>
      ) : <X className="w-4 h-4 text-slate-300 mx-auto" />,
    }),
    columnHelper.accessor('mainlandAvailable', {
      header: '内地',
      cell: info => info.getValue() ? (
        <div className="w-8 h-8 rounded bg-[#CCFBF1] flex items-center justify-center border border-[#5EEAD4] mx-auto">
          <Check className="w-4 h-4 text-[#115E59]" />
        </div>
      ) : <X className="w-4 h-4 text-slate-300 mx-auto" />,
    }),
    columnHelper.accessor('remarks', {
      header: '备注',
      cell: info => <span className="text-sm text-slate-500">{info.getValue()}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: '操作',
      cell: info => (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setEditingProject(info.row.original)}
          className="text-slate-400 hover:text-indigo-600"
        >
          <Edit2 size={16} />
        </Button>
      ),
    }),
  ], []);

  const filteredData = useMemo(() => {
    if (!localOnly) return data;
    return data.filter(item => item.hkuAvailable || item.cityuAvailable || item.milesAvailable);
  }, [data, localOnly]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleSaveProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const projectData: any = {
      id: editingProject?.id || Date.now().toString(),
      name: formData.get('name') as string,
      kuaiyicePrice: formData.get('kuaiyicePrice') as string,
      kuaiyiceDetail: formData.get('kuaiyiceDetail') as string,
      compassPrice: formData.get('compassPrice') as string,
      compassDetail: formData.get('compassDetail') as string,
      recommendation: formData.get('recommendation') as string,
      hkuAvailable: formData.get('hkuAvailable') === 'on',
      cityuAvailable: formData.get('cityuAvailable') === 'on',
      milesAvailable: formData.get('milesAvailable') === 'on',
      mainlandAvailable: formData.get('mainlandAvailable') === 'on',
      remarks: formData.get('remarks') as string,
    };

    if (isAdding) {
      onAddProject(projectData);
    } else {
      onUpdateProject(projectData);
    }
    setEditingProject(null);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索测试项目..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              checked={localOnly}
              onChange={e => setLocalOnly(e.target.checked)}
            />
            <span className="text-sm text-slate-600 font-medium">仅显示本地可测</span>
          </label>
          <Button onClick={() => { setIsAdding(true); setEditingProject({} as TestProject); }} className="gap-2">
            <Plus size={18} />
            <span>新增项目</span>
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-slate-50 border-b border-slate-200">
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2 justify-center first:justify-start">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown className="w-3 h-3" />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 text-sm text-center first:text-left">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredData.map(project => (
            <div key={project.id} className="p-4 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <button 
                  onClick={() => onNavigateToRegistration(project.name)}
                  className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline text-left transition-colors"
                  title="点击去送样登记"
                >
                  {project.name}
                </button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setEditingProject(project)}
                  className="text-slate-400 p-1 h-auto"
                >
                  <Edit2 size={16} />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="text-xs text-slate-400 uppercase font-bold">快易测</div>
                  <div 
                    className={cn(
                      "text-slate-700",
                      project.kuaiyiceDetail && "underline decoration-dotted cursor-pointer"
                    )}
                    onClick={() => project.kuaiyiceDetail && setSelectedDetail({ title: `${project.name} - 快易测详情`, content: project.kuaiyiceDetail })}
                  >
                    {project.kuaiyicePrice}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-400 uppercase font-bold">科学指南针</div>
                  <div 
                    className={cn(
                      "text-slate-700",
                      project.compassDetail && "underline decoration-dotted cursor-pointer"
                    )}
                    onClick={() => project.compassDetail && setSelectedDetail({ title: `${project.name} - 科学指南针详情`, content: project.compassDetail })}
                  >
                    {project.compassPrice}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">推荐: {project.recommendation}</Badge>
                {project.hkuAvailable && <Badge className="bg-[#FEF9C3] text-[#854D0E] border-[#FDE047]">HKU</Badge>}
                {project.cityuAvailable && <Badge className="bg-[#FCE7F3] text-[#9D174D] border-[#F9A8D4]">CityU</Badge>}
                {project.milesAvailable && <Badge className="bg-[#DBEAFE] text-[#1E40AF] border-[#93C5FD]">MILES</Badge>}
                {project.mainlandAvailable && <Badge className="bg-[#CCFBF1] text-[#115E59] border-[#5EEAD4]">内地</Badge>}
              </div>

              {project.remarks && (
                <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
                  备注: {project.remarks}
                </div>
              )}
            </div>
          ))}
          {filteredData.length === 0 && (
            <div className="p-8 text-center text-slate-400 italic">
              暂无测试项目
            </div>
          )}
        </div>
      </Card>

      {/* Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedDetail(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{selectedDetail.title}</h3>
            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto pr-2">
              {selectedDetail.content}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setSelectedDetail(null)}>关闭</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit/Add Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <Card className="w-full max-w-2xl p-6 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => { setEditingProject(null); setIsAdding(false); }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold text-slate-900 mb-6">
              {isAdding ? '新增测试项目' : '编辑测试项目'}
            </h3>
            
            <form onSubmit={handleSaveProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 uppercase">项目名称</label>
                  <input name="name" defaultValue={editingProject.name} required className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 uppercase">推荐选择</label>
                  <input name="recommendation" defaultValue={editingProject.recommendation} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 uppercase">快易测价格 (如: 90/样)</label>
                  <input name="kuaiyicePrice" defaultValue={editingProject.kuaiyicePrice} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 uppercase">科学指南针价格 (如: 90/样)</label>
                  <input name="compassPrice" defaultValue={editingProject.compassPrice} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase">快易测详情 (PDF内容)</label>
                <textarea name="kuaiyiceDetail" defaultValue={editingProject.kuaiyiceDetail} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase">科学指南针详情 (PDF内容)</label>
                <textarea name="compassDetail" defaultValue={editingProject.compassDetail} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="hkuAvailable" defaultChecked={editingProject.hkuAvailable} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm text-slate-600">HKU</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="cityuAvailable" defaultChecked={editingProject.cityuAvailable} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm text-slate-600">CityU</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="milesAvailable" defaultChecked={editingProject.milesAvailable} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm text-slate-600">MILES</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="mainlandAvailable" defaultChecked={editingProject.mainlandAvailable} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm text-slate-600">内地</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase">备注</label>
                <input name="remarks" defaultValue={editingProject.remarks} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
              </div>

              <div className="mt-8 flex justify-between gap-3">
                {!isAdding && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="text-rose-500 hover:bg-rose-50"
                    onClick={() => {
                      if (confirm('确定要删除此项目吗？')) {
                        onDeleteProject(editingProject.id);
                        setEditingProject(null);
                      }
                    }}
                  >
                    删除项目
                  </Button>
                )}
                <div className="flex gap-3 ml-auto">
                  <Button type="button" variant="ghost" onClick={() => { setEditingProject(null); setIsAdding(false); }}>取消</Button>
                  <Button type="submit">保存更改</Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
