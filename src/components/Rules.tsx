import React from 'react';
import { Card } from './UI';
import { MapPin, FlaskConical, Globe, ShieldCheck, AlertTriangle } from 'lucide-react';

export function Rules() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-indigo-600" />
          学生测试推荐规则 (2024年3月修订)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-[#FDE047] bg-[#FEF9C3]/10">
            <h4 className="font-bold text-[#854D0E] mb-3 flex items-center gap-2">
              <FlaskConical className="w-4 h-4" /> 香港地区 (HKU & CityU)
            </h4>
            <ul className="text-sm text-slate-700 space-y-2 list-disc pl-4">
              <li>优先使用 HKU 和 CityU 本地平台设备，以方便程度和预约时间为准。</li>
              <li>CityU 现已开放更多共享设备（如 MSE 实验室），具体请查询“本地平台目录”。</li>
              <li className="font-bold text-red-600">只有当 HKU 和 CityU 两个平台都没有该设备时，方可申请校外送样测试。</li>
            </ul>
          </Card>

          <Card className="border-l-4 border-l-[#93C5FD] bg-[#DBEAFE]/10">
            <h4 className="font-bold text-[#1E40AF] mb-3 flex items-center gap-2">
              <FlaskConical className="w-4 h-4" /> MILES 地区
            </h4>
            <ul className="text-sm text-slate-700 space-y-2 list-disc pl-4">
              <li>优先使用 MILES 本地平台设备进行测试。</li>
              <li className="font-bold text-red-600">当 MILES 本地平台无法满足测试需求时，方可申请外送测试。</li>
              <li>外送测试需遵循“就近原则”，优先考虑周边高校共享平台。</li>
            </ul>
          </Card>

          <Card className="border-l-4 border-l-[#5EEAD4] bg-[#CCFBF1]/10">
            <h4 className="font-bold text-[#115E59] mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" /> 内地地区
            </h4>
            <ul className="text-sm text-slate-700 space-y-2 list-disc pl-4">
              <li>由于无本地测试平台，原则上推荐使用送样机构（快易测、科学指南针等）。</li>
              <li className="font-bold text-indigo-600">除 XRD 等极少数项目外，均可直接考虑送样机构。</li>
              <li>送样前请对比两家机构的价格与服务，选择最优方案。</li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          测试机构使用规则 (外送测试)
        </h3>
        <Card className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 font-bold shrink-0">1</div>
            <div>
              <p className="font-bold text-slate-900">公共账号预约</p>
              <p className="text-sm text-slate-500 mt-1">所有机构测试必须通过课题组公共账号进行预约下单，严禁使用个人账号。下单时请务必备注“ZHI Group - 姓名”。</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 font-bold shrink-0">2</div>
            <div>
              <p className="font-bold text-slate-900">金额审批界限 (2000 RMB)</p>
              <p className="text-sm text-slate-500 mt-1">单项测试预计总价超过 <span className="font-bold text-indigo-600">2000 元（含）</span> 的测试，必须提前在系统中提交“机构测试审批表”，待导师在线审批通过后方可送样。</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 font-bold shrink-0">3</div>
            <div>
              <p className="font-bold text-slate-900">如实登记与核对</p>
              <p className="text-sm text-slate-500 mt-1">所有外送测试必须在“机构送样登记表”中如实登记。管理员将定期核对订单号、样品数与发票金额，确保账目清晰。</p>
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
