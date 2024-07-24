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

export const useNavigationBlocker = (
  navigationBlockDecisionParams:
    | RoleEditDetailsNavigationBlockerParams
    | RoleEditPageNavigationBlockerParams,
) => {
  const blocker: Blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (currentLocation.pathname === `/${DAO_ROUTES.rolesEditDetails.path}`) {
      const { wasRoleActuallyEdited, values, touched } =
        navigationBlockDecisionParams as RoleEditDetailsNavigationBlockerParams;

      return (
        !!values.roleEditing &&
        !!touched.roleEditing &&
        wasRoleActuallyEdited &&
        currentLocation.pathname !== nextLocation.pathname
      );
    }

    if (currentLocation.pathname === `/${DAO_ROUTES.rolesEdit.path}`) {
      const { hasEditedRoles } =
        navigationBlockDecisionParams as RoleEditPageNavigationBlockerParams;

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
