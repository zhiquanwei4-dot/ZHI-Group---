import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  ClipboardCheck, 
  FileText, 
  Info, 
  ChevronLeft, 
  ChevronRight,
  FlaskConical
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
  { id: 'overview', label: '测试项目总览', icon: LayoutDashboard },
  { id: 'local', label: '本地平台目录', icon: Building2 },
  { id: 'registration', label: '机构送样登记', icon: ClipboardCheck },
  { id: 'approval', label: '机构测试审批', icon: FileText },
  { id: 'rules', label: '规则说明', icon: Info },
];

export function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }: SidebarProps) {
  return (
    <aside 
      className={cn(
        "bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col h-screen sticky top-0",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-indigo-500 p-2 rounded-lg">
          <FlaskConical className="w-6 h-6 text-white" />
        </div>
        {!collapsed && (
          <div className="font-bold text-sm text-white leading-tight">
            <div>ZHI Group</div>
            <div>测试表征管理系统</div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group",
              activeTab === item.id 
                ? "bg-indigo-600 text-white" 
                : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon className={cn("w-5 h-5 shrink-0", activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-white")} />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-4 border-t border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </aside>
  );
}
