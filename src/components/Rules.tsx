import React from 'react';
import { Card } from './UI';
import { MapPin, FlaskConical, Globe, ShieldCheck, AlertTriangle } from 'lucide-react';

export function Rules() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-indigo-600" />
          学生测试推荐规则
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-[#FDE047] bg-[#FEF9C3]/10">
            <h4 className="font-bold text-[#854D0E] mb-3 flex items-center gap-2">
              <FlaskConical className="w-4 h-4" /> 香港地区
            </h4>
            <ul className="text-sm text-slate-700 space-y-2 list-disc pl-4">
              <li>HKU 和 CityU 的设备自行选择，以自己方便为准。</li>
              <li>具体内容请查询“本地平台目录”。</li>
              <li className="font-bold text-red-600">除非这两个平台都没有，才能申请机构送样。</li>
            </ul>
          </Card>

          <Card className="border-l-4 border-l-[#93C5FD] bg-[#DBEAFE]/10">
            <h4 className="font-bold text-[#1E40AF] mb-3 flex items-center gap-2">
              <FlaskConical className="w-4 h-4" /> MILES 地区
            </h4>
            <ul className="text-sm text-slate-700 space-y-2 list-disc pl-4">
              <li>优先使用 MILES 本地平台设备。</li>
              <li className="font-bold text-red-600">当 MILES 没有的，才能申请机构送样。</li>
            </ul>
          </Card>

          <Card className="border-l-4 border-l-[#5EEAD4] bg-[#CCFBF1]/10">
            <h4 className="font-bold text-[#115E59] mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" /> 内地地区
            </h4>
            <ul className="text-sm text-slate-700 space-y-2 list-disc pl-4">
              <li>由于无本地测试平台，原则上推荐送样机构。</li>
              <li className="font-bold text-indigo-600">除 XRD 外，均可直接考虑送样机构。</li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          测试机构使用规则
        </h3>
        <Card className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">1</div>
            <div>
              <p className="font-bold text-slate-900">公共账号预约</p>
              <p className="text-sm text-slate-500 mt-1">所有机构测试（快易测、科学指南针等）只能通过课题组公共账号进行预约下单，严禁使用个人账号。</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">2</div>
            <div>
              <p className="font-bold text-slate-900">金额审批界限</p>
              <p className="text-sm text-slate-500 mt-1">单项预计总价不超过 <span className="font-bold text-indigo-600">2000 元</span> 的测试，可先登记后送样；超过 2000 元必须先审批通过。</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">3</div>
            <div>
              <p className="font-bold text-slate-900">诚实登记原则</p>
              <p className="text-sm text-slate-500 mt-1">所有外送测试必须如实登记，管理员将定期抽查订单号与登记信息的匹配情况。</p>
            </div>
          </div>
        </Card>
      </section>

      <Card className="bg-red-50 border-red-100">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <p className="font-bold mb-1">重要提醒：</p>
            原则上不得先测试后补审批。对于未按流程操作的高价测试，课题组可能不予报销相关费用。
          </div>
        </div>
      </Card>
    </div>
  );
}
