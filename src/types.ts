import { z } from 'zod';

// --- Types ---

export type Platform = 'ME' | 'CHEM' | '生命科学系' | 'UCF' | 'MILES';
export type Region = '香港' | 'MILES' | '内地';
export type QuoteType = '按样' | '按小时' | '按次' | '其他';
export type ApprovalStatus = '待审批' | '通过' | '驳回' | '无需审批';

export interface TestProject {
  id: string;
  name: string;
  kuaiyicePrice: string;
  kuaiyiceDetail?: string;
  compassPrice: string;
  compassDetail?: string;
  recommendation: string;
  hkuAvailable: boolean;
  cityuAvailable: boolean;
  milesAvailable: boolean;
  mainlandAvailable: boolean;
  remarks: string;
}

export interface LocalPlatformItem {
  id: string;
  name: string;
  platform: Platform;
  instrumentName: string;
  hkuUserFee: string;
  billingMethod: string;
  remarks: string;
}

export interface RegistrationRecord {
  id: string;
  date: string;
  applicant: string;
  region: Region;
  sampleName: string;
  testProject: string;
  sampleCount: number;
  checkedPlatforms: string;
  reason: string;
  institution: '快易测' | '科学指南针';
  quoteType: QuoteType;
  unitPrice: number;
  totalPrice: number;
  status: '待核对' | '已核对';
  orderNumber: string;
}

export interface ApprovalRecord {
  id: string;
  date: string;
  applicant: string;
  region: Region;
  sampleName: string;
  testProject: string;
  institution: '快易测' | '科学指南针';
  quoteType: QuoteType;
  unitPrice: number;
  sampleCount: number;
  totalPrice: number;
  corePurpose: string;
  reasonForExternal: string;
  quoteLink: string;
  status: ApprovalStatus;
  approvalDate?: string;
  approvalRemarks?: string;
}

// --- Schemas ---

export const registrationSchema = z.object({
  applicant: z.string().min(1, '请输入申请人'),
  region: z.enum(['香港', 'MILES', '内地']),
  sampleName: z.string().min(1, '请输入样品名称'),
  testProject: z.string().min(1, '请输入测试项目'),
  sampleCount: z.number().min(1, '数量至少为1'),
  checkedPlatforms: z.string().min(1, '请输入已核查平台'),
  reason: z.string().min(1, '请输入原因'),
  institution: z.enum(['快易测', '科学指南针']),
  quoteType: z.enum(['按样', '按小时', '按次', '其他']),
  unitPrice: z.number().min(0, '单价不能为负'),
  orderNumber: z.string().optional(),
});

export const approvalSchema = z.object({
  applicant: z.string().min(1, '请输入申请人'),
  region: z.enum(['香港', 'MILES', '内地']),
  sampleName: z.string().min(1, '请输入样品名称'),
  testProject: z.string().min(1, '请输入测试项目'),
  institution: z.enum(['快易测', '科学指南针']),
  quoteType: z.enum(['按样', '按小时', '按次', '其他']),
  unitPrice: z.number().min(0, '单价不能为负'),
  sampleCount: z.number().min(1, '数量至少为1'),
  corePurpose: z.string().min(1, '请输入核心目的'),
  reasonForExternal: z.string().min(1, '请输入外测原因'),
  quoteLink: z.string().optional(),
});
