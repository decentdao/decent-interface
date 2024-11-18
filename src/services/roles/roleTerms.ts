import { Address, Hex } from 'viem';
import { RoleFormTermStatus } from '../../types/roles';

export type RoleTermPosition = 'currentTerm' | 'nextTerm' | undefined;

export type RoleTermData = {
  nominee: Address;
  termEndDate: Date;
  termNumber: number;
  isActive?: boolean;
};

export type RoleTermConfig = {
  adminHatWearer: Address;
  roleHatId: Hex;
  roleHatWearer: Address;
  roleTermActive: boolean;
};

/**
 * Creates props object for RoleTerm component
 */
export function createRoleTermViewProps(
  termData: RoleTermData,
  termStatus: RoleFormTermStatus,
  config: RoleTermConfig,
  displayLightContainer: boolean,
) {
  // Determine term position based on status
  const termPosition: RoleTermPosition = (() => {
    switch (termStatus) {
      case RoleFormTermStatus.Current:
        return 'currentTerm';
      case RoleFormTermStatus.Queued:
        return 'nextTerm';
      default:
        return undefined;
    }
  })();

  // Create header props
  const termHeaderTitleProps = {
    termNumber: termData.termNumber,
    termPosition,
  };

  const termHeaderStatusProps = {
    termEndDate: termData.termEndDate,
    termStatus,
  };

  // Combine all props
  return {
    termHeaderTitleProps,
    termHeaderStatusProps,
    adminHatWearer: config.adminHatWearer,
    roleHatId: config.roleHatId,
    roleHatWearer: config.roleHatWearer,
    roleTermActive: config.roleTermActive,
    termNominatedWearer: termData.nominee,
    displayLightContainer,
  };
}

/**
 * Helper to determine term status based on term data
 */
export function determineTermStatus(
  termData: RoleTermData,
  isCurrentTerm: boolean,
  isNextTerm: boolean,
): RoleFormTermStatus {
  if (termData.termEndDate.getTime() < Date.now()) {
    return RoleFormTermStatus.Expired;
  }

  if (isCurrentTerm) {
    return termData.isActive ? RoleFormTermStatus.Current : RoleFormTermStatus.ReadyToStart;
  }

  if (isNextTerm) {
    return RoleFormTermStatus.Queued;
  }

  return RoleFormTermStatus.Pending;
}
