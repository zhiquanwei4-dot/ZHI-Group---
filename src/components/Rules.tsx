import React from 'react';
import { Card, Badge } from './UI';
import { MapPin, FlaskConical, Globe, ShieldCheck, AlertTriangle, Key, ClipboardCheck, FileText } from 'lucide-react';

export function Rules() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* 1. Regional Rules (3 Blocks) */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-indigo-600" />
          学生测试推荐规则
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-[#FDE047] bg-[#FEF9C3]/10 p-5 space-y-3">
            <h4 className="font-bold text-[#854D0E] flex items-center gap-2">
              <FlaskConical className="w-4 h-4" /> 香港地区 (HKU & CityU)
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              优先使用 HKU 和 CityU 本地平台设备。只有当两个平台都没有该设备时，方可申请校外送样。
            </p>
          </Card>

          <Card className="border-l-4 border-l-[#93C5FD] bg-[#DBEAFE]/10 p-5 space-y-3">
            <h4 className="font-bold text-[#1E40AF] flex items-center gap-2">
              <FlaskConical className="w-4 h-4" /> MILES 地区
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              优先使用 MILES 本地平台设备。当本地平台无法满足需求时，方可申请外送测试。
            </p>
          </Card>

          <Card className="border-l-4 border-l-[#5EEAD4] bg-[#CCFBF1]/10 p-5 space-y-3">
            <h4 className="font-bold text-[#115E59] flex items-center gap-2">
              <Globe className="w-4 h-4" /> 内地地区
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              由于无本地测试平台，原则上推荐使用送样机构（快易测、科学指南针等）。
            </p>
          </Card>
        </div>
      </section>

      {/* 2. Process Rules (2 Blocks) */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          送样流程说明
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-t-4 border-t-violet-500 bg-violet-50/30">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-violet-800 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" /> 2000元以内 (不含)
              </h4>
              <Badge className="bg-violet-100 text-violet-700 border-violet-200">仅需登记</Badge>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              单项测试预计总价在 <span className="font-bold text-violet-600">2000元以下</span> 的，无需审批。
              送样后请在 <span className="font-bold underline">“机构送样登记表”</span> 中如实填写相关信息即可。
            </p>
          </Card>

          <Card className="p-6 border-t-4 border-t-amber-500 bg-amber-50/30">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-amber-800 flex items-center gap-2">
                <FileText className="w-5 h-5" /> 2000元以上 (含)
              </h4>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">必须审批</Badge>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              单项测试预计总价超过 <span className="font-bold text-amber-600">2000元</span> 的，必须提前在 <span className="font-bold underline">“机构测试审批表”</span> 中提交申请。
              待导师在线审批通过后，方可进行送样测试。
            </p>
          </Card>
        </div>
      </section>

      {/* 3. Account Info (1 Block) */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Key className="w-6 h-6 text-indigo-600" />
          机构测试公共账号
        </h3>
        <Card className="overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">机构名称</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">公共账号/手机号</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">备注说明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">快易测</td>
                  <td className="px-6 py-4 font-mono text-indigo-600">138****8888</td>
                  <td className="px-6 py-4 text-slate-500">下单请备注“ZHI Group - 姓名”，验证码请联系管理员</td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">科学指南针</td>
                  <td className="px-6 py-4 font-mono text-indigo-600">139****9999</td>
                  <td className="px-6 py-4 text-slate-500">统一使用课题组公共账号，严禁使用个人账号下单</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* 4. Important Reminder (1 Block) */}
      <Card className="bg-rose-50 border-rose-100 p-6">
        <div className="flex gap-4">
          <div className="bg-rose-100 p-2 rounded-full h-fit">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-rose-900">重要提醒：严禁先测后补</h4>
            <p className="text-sm text-rose-800 leading-relaxed">
              原则上不得先测试后补审批。对于未按流程操作、私自进行的高价测试，课题组将不予报销相关费用。
              所有外送测试必须通过公共账号下单，以便管理员核对账目。
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
