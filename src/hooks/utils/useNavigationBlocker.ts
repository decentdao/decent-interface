import { Blocker, useBlocker } from 'react-router-dom';
import { Address, Hex } from 'viem';
import { EditedRole } from '../../components/pages/Roles/types';
import { DAO_ROUTES } from '../../constants/routes';
import { BigIntValuePair } from '../../types';

interface RoleEditDetailsNavigationBlockerParams {
  wasRoleActuallyEdited: boolean;
  values: {
    roleEditing?: {
      prettyId?: string;
      name?: string;
      description?: string;
      smartAddress?: Address;
      id: Hex;
      wearer?: string;
      // Not a user-input field.
      // `resolvedWearer` is auto-populated from the resolved address of `wearer` in case it's an ENS name.
      resolvedWearer?: Address;
      payments: {
        streamId: string;
        contractAddress: Address;
        asset: {
          address: Address;
          name: string;
          symbol: string;
          decimals: number;
          logo: string;
        };
        amount: BigIntValuePair;
        startDate: Date;
        endDate: Date;
        cliffDate?: Date;
        withdrawableAmount: bigint;
        isCancelled: boolean;
        isStreaming: () => boolean;
        isCancellable: () => boolean;
        isCancelling: boolean;
      }[];
      // form specific state
      editedRole?: EditedRole;
      roleEditingPaymentIndex?: number;
    };
  };
  touched: any;
}

interface RoleEditPageNavigationBlockerParams {
  hasEditedRoles: boolean;
}

interface NavigationBlockDecisionParams {
  roleEditPageNavigationBlockerParams?: RoleEditPageNavigationBlockerParams;
  roleEditDetailsNavigationBlockerParams?: RoleEditDetailsNavigationBlockerParams;
}

export const useNavigationBlocker = ({
  roleEditDetailsNavigationBlockerParams,
  roleEditPageNavigationBlockerParams,
}: NavigationBlockDecisionParams) => {
  const blocker: Blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (
      currentLocation.pathname === `/${DAO_ROUTES.rolesEditDetails.path}` &&
      !!roleEditDetailsNavigationBlockerParams
    ) {
      const { wasRoleActuallyEdited, values, touched } = roleEditDetailsNavigationBlockerParams;

      return (
        !!values.roleEditing &&
        !!touched.roleEditing &&
        wasRoleActuallyEdited &&
        currentLocation.pathname !== nextLocation.pathname
      );
    }

    if (
      currentLocation.pathname === `/${DAO_ROUTES.rolesEdit.path}` &&
      !!roleEditPageNavigationBlockerParams
    ) {
      const { hasEditedRoles } = roleEditPageNavigationBlockerParams;

      return (
        hasEditedRoles &&
        currentLocation.pathname !== nextLocation.pathname &&
        nextLocation.pathname !== `/${DAO_ROUTES.rolesEditDetails.path}`
      );
    }

    return false;
  });

  return blocker;
};
