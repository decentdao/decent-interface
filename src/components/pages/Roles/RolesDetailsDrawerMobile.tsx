import { Flex, IconButton, Icon, Text, Box } from '@chakra-ui/react';
import { PencilLine } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Hex } from 'viem';
import PayrollAndVesting from '../../../pages/daos/[daoAddress]/roles/details/PayrollAndVesting';
import { useFractal } from '../../../providers/App/AppProvider';
import { useRolesState } from '../../../state/useRolesState';
import DraggableDrawer from '../../ui/containers/DraggableDrawer';
import { AvatarAndRoleName } from './RoleCard';
import { SablierPayroll, SablierVesting } from './types';

interface RoleDetailsDrawerMobileProps {
  roleHat: {
    id: Hex;
    name: string;
    wearer: string;
    description: string;
  };
  payroll?: SablierPayroll;
  vesting?: SablierVesting;
  onOpen?: () => void;
  onClose?: () => void;
  isOpen?: boolean;
  onEdit: (hatId: Hex) => void;
}

export default function RolesDetailsDrawerMobile({
  roleHat,
  onClose,
  onOpen,
  isOpen = true,
  onEdit,
  payroll,
  vesting,
}: RoleDetailsDrawerMobileProps) {
  const {
    node: { daoAddress },
  } = useFractal();
  const { t } = useTranslation('roles');
  const { hatsTree } = useRolesState();

  if (!daoAddress || !hatsTree) return null;

  return (
    <DraggableDrawer
      onClose={onClose ?? (() => {})}
      onOpen={onOpen ?? (() => {})}
      isOpen={isOpen}
      headerContent={
        <Flex
          justifyContent="space-between"
          mx="-0.5rem"
        >
          <AvatarAndRoleName
            wearerAddress={roleHat.wearer}
            name={roleHat.name}
          />
          <Flex
            alignItems="center"
            gap="1rem"
          >
            <IconButton
              variant="tertiary"
              aria-label="Edit Role"
              onClick={() => onEdit(roleHat.id)}
              size="icon-sm"
              icon={
                <Icon
                  as={PencilLine}
                  color="lilac-0"
                  aria-hidden
                  weight="fill"
                />
              }
            />
          </Flex>
        </Flex>
      }
    >
      <Box
        px="1rem"
        mb="1rem"
      >
        <Text
          color="neutral-7"
          textStyle="button-small"
        >
          {t('roleDescription')}
        </Text>
        <Text textStyle="body-base">{roleHat.description}</Text>
      </Box>
      <Box
        px="1rem"
        mb="1.5rem"
      >
        <PayrollAndVesting
          payroll={payroll}
          vesting={vesting}
        />
      </Box>
    </DraggableDrawer>
  );
}
