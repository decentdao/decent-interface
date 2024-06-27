import { Address } from "viem";

export type RoleViewMode = 'edit' | 'view';
export interface RoleProps {
  mode?: RoleViewMode;
  roleName: string;
  wearerAddress: Address | undefined;
  vestingData?: {
    vestingSchedule: string;
    vestingAmount: string;
    asset: {
      address: string;
      symbol: string;
      name: string;
      iconUri: string;
    };
  };
  payrollData?: {
    payrollSchedule: string;
    payrollAmount: string;
    asset: {
      address: string;
      symbol: string;
      name: string;
      iconUri: string;
    };
  };
}