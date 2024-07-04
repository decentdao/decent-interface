import { zeroAddress } from 'viem';
import { SablierPayroll } from '../components/pages/Roles/types';
import { DecentRoleHat } from '../state/useRolesState';

export const mockHats: DecentRoleHat[] = [
  {
    id: '0x1',
    wearer: zeroAddress,
    name: 'Legal Reviewer',
    description:
      'In this role, you will review and analyze smart contracts and blockchain-based applications to ensure legal compliance, while advising on regulatory requirements and legal risks related to decentralized technologies. Your responsibilities include conducting legal research on blockchain regulations, drafting and reviewing legal documents, and collaborating with developers, project managers, and external legal counsel to ensure all projects adhere to relevant laws. Staying up-to-date with the latest developments in blockchain law and regulatory changes is essential.',
    prettyId: '0001.0001',
  },
  {
    id: '0x2',
    wearer: zeroAddress,
    name: 'Marketer',
    description: 'The Marketer role has...',
    prettyId: '0001.0001',
  },
  {
    id: '0x3',
    wearer: zeroAddress,
    name: 'Developer',
    description: 'The Developer role has...',
    prettyId: '0001.0001',
  },
];

export const mockPayroll: SablierPayroll = {
  payrollSchedule: 'Monthly',
  payrollAmount: '5000',
  payrollAmountUSD: '$5,000',
  payrollStartDate: '2024-06-09, 12:30-06',
  payrollEndDate: '2025-06-09, 12:30-06',
  asset: {
    symbol: 'USDC',
    address: '0x73d219b3881e481394da6b5008a081d623992200', // Sepolia USDC,
    name: 'USD Coin',
    iconUri: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=032',
  },
};
