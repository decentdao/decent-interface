import { Blocker, useBlocker } from 'react-router-dom';
import { RoleFormValues } from '../../components/pages/Roles/types';
import { DAO_ROUTES } from '../../constants/routes';

interface RoleEditDetailsNavigationBlockerParams {
  wasRoleActuallyEdited: boolean;
  values: RoleFormValues;
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
