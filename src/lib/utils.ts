import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(value);
}

export function getStatusColor(status: string) {
  switch (status) {
    case '待审批':
    case '待核对':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case '通过':
    case '已核对':
      return 'bg-green-100 text-green-800 border-green-200';
    case '驳回':
      return 'bg-red-100 text-red-800 border-red-200';
    case '无需审批':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200';
  }
}
