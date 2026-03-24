import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Search, ExternalLink } from 'lucide-react';
import { LocalPlatformItem, Platform } from '../types';
import { Card } from './UI';
import { cn } from '../lib/utils';
import { PLATFORM_URLS } from '../constants';

interface LocalDirectoryProps {
  data: LocalPlatformItem[];
}

const platforms: Platform[] = ['ME', 'CHEM', '生命科学系', 'UCF', 'MILES', 'CityU'];

export function LocalDirectory({ data }: LocalDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<Platform>>(new Set(platforms));

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

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="搜索测试项目或设备名..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
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
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">HKU user 费用</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">计费方式</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">备注</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {platformItems.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{item.instrumentName}</td>
                            <td className="px-6 py-4 text-sm text-indigo-600 font-medium">{item.hkuUserFee}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{item.billingMethod}</td>
                            <td className="px-6 py-4 text-sm text-slate-400 italic">{item.remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-slate-50 bg-white">
                    {platformItems.map(item => (
                      <div key={item.id} className="p-4 space-y-2">
                        <div className="font-bold text-slate-900 text-sm">{item.name}</div>
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
    </div>
  );
}
