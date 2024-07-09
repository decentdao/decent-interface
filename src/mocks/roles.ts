import { SablierPayroll, SablierVesting } from '../components/pages/Roles/types';

export const mockSablierAsset = {
  symbol: 'USDC',
  address: '0x73d219b3881e481394da6b5008a081d623992200', // Sepolia USDC,
  name: 'USD Coin',
  iconUri: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=032',
} as const;

export const mockPayroll: SablierPayroll = {
  payrollSchedule: 'Monthly',
  payrollAmount: '5000',
  payrollAmountUSD: '$5,000',
  payrollStartDate: '2024-06-09, 12:30-06',
  payrollEndDate: '2025-06-09, 12:30-06',
  asset: mockSablierAsset,
};

export const mockVesting: SablierVesting = {
  vestingSchedule: 'Monthly',
  vestingAmount: '5000',
  vestingAmountUSD: '$5,000',
  vestingStartDate: '2024-06-09, 12:30-06',
  vestingEndDate: '2025-06-09, 12:30-06',
  asset: mockSablierAsset,
};
