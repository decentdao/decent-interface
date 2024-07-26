import { useBreakpointValue } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Blocker, useBlocker } from 'react-router-dom';
import { RoleFormValues } from '../../components/pages/Roles/types';
import { ModalType } from '../../components/ui/modals/ModalProvider';
import { useFractalModal } from '../../components/ui/modals/useFractalModal';
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

  const shouldEditWarnModalOpen = useBreakpointValue({
    base: false,
    md: blocker.state === 'blocked',
  });

  const [isWarnModalOpen, setIsWarnModalOpen] = useState(false);

  const warnEditModal = useFractalModal(ModalType.WARN_UNSAVED_CHANGES, {
    discardChanges: blocker.proceed,
    keepEditing: blocker.reset,
    onClose: () => setIsWarnModalOpen(false),
  });

  useEffect(() => {
    if (shouldEditWarnModalOpen && !isWarnModalOpen) {
      setIsWarnModalOpen(true);
      warnEditModal();
    }
  }, [isWarnModalOpen, shouldEditWarnModalOpen, warnEditModal]);

  return blocker;
};
