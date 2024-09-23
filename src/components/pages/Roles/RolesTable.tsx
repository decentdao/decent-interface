import { Box, Flex, Icon, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { PencilLine } from '@phosphor-icons/react';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Address, Hex, zeroAddress } from 'viem';
import { isFeatureEnabled } from '../../../constants/common';
import useAddress from '../../../hooks/utils/useAddress';
import useAvatar from '../../../hooks/utils/useAvatar';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { DecentTree, useRolesStore } from '../../../store/roles';
import Avatar from '../../ui/page/Header/Avatar';
import EditBadge from './EditBadge';
import { RoleCardLoading, RoleCardNoRoles } from './RolePageCard';
import { EditBadgeStatus, RoleEditProps, RoleFormValues, RoleProps } from './types';

function RolesHeader() {
  const { t } = useTranslation(['roles']);
  return (
    <Thead
      sx={{
        th: {
          padding: '0.75rem',
          textTransform: 'none',
          fontWeight: 'normal',
        },
      }}
      bg="white-alpha-04"
    >
      <Tr
        textStyle="label-base"
        color="neutral-7"
      >
        <Th
          width="25%"
          minW="230px"
        >
          {t('role')}
        </Th>
        <Th width="60%">{t('member')}</Th>
        {isFeatureEnabled('STREAMS') && (
          <Th
            width="15%"
            minWidth="140px"
            textAlign="center"
          >
            {t('activePayments')}
          </Th>
        )}
      </Tr>
    </Thead>
  );
}

function RoleNameEditColumn({
  roleName,
  editStatus,
}: {
  roleName?: string;
  editStatus?: EditBadgeStatus;
}) {
  return (
    <Td
      width="25%"
      minW="230px"
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
        gap="1rem"
      >
        <Flex
          alignItems="center"
          justifyContent="space-between"
          w="full"
        >
          <Text
            textStyle="body-base"
            color="lilac-0"
          >
            {roleName}
          </Text>
          <EditBadge editStatus={editStatus} />
        </Flex>
        <Icon
          className="edit-role-icon"
          as={PencilLine}
          color="white-0"
          boxSize="1rem"
          opacity={0}
          transition="opacity 0.3s ease-out"
        />
      </Flex>
    </Td>
  );
}

function MemberColumn({ wearerAddress }: { wearerAddress: string | undefined }) {
  const { chain } = useNetworkConfig();
  const a = useAddress(wearerAddress || zeroAddress);
  const { displayName: accountDisplayName } = useDisplayName(a.address || null, true, chain.id);
  const avatarURL = useAvatar(accountDisplayName);

  const { t } = useTranslation('roles');
  return (
    <Td width="60%">
      <Flex>
        {a.address ? (
          <Avatar
            size="icon"
            address={a.address}
            url={avatarURL}
          />
        ) : (
          <Box
            boxSize="3rem"
            borderRadius="100%"
            bg="white-alpha-04"
          />
        )}
        <Text
          textStyle="body-base"
          color="white-0"
          ml="0.5rem"
        >
          {wearerAddress ? accountDisplayName : t('unassigned')}
        </Text>
      </Flex>
    </Td>
  );
}

function PaymentsColumn({ paymentsCount }: { paymentsCount?: number }) {
  const { t } = useTranslation('common');
  return (
    <Td
      width="15%"
      minWidth="140px"
      textAlign="center"
      color="neutral-5"
      textStyle="body-base"
    >
      {paymentsCount !== undefined ? (
        <Box
          as="span"
          display="inline-block"
          textStyle="helper-text-small"
          lineHeight="1rem"
          textAlign="center"
          bg="celery--2"
          color="neutral-3"
          borderColor="neutral-3"
          borderWidth="2px"
          borderRadius="50%"
          w="1.25rem"
          h="1.25rem"
        >
          {paymentsCount}
        </Box>
      ) : (
        t('none')
      )}
    </Td>
  );
}

export function RolesRow({
  name,
  wearerAddress,
  paymentsCount,
  handleRoleClick,
  hatId,
}: RoleProps) {
  return (
    <Tr
      sx={{
        td: { padding: '0.75rem', height: '4rem' },
        '&:hover': {
          '.edit-role-icon': { opacity: 1 },
        },
      }}
      _hover={{ bg: 'neutral-3' }}
      _active={{ bg: 'neutral-2', border: '1px solid', borderColor: 'neutral-3' }}
      transition="all ease-out 300ms"
      onClick={() => handleRoleClick(hatId)}
    >
      <Td
        textStyle="body-base"
        color="lilac-0"
        width="25%"
        minW="230px"
      >
        {name}
      </Td>
      <MemberColumn wearerAddress={wearerAddress} />
      {isFeatureEnabled('STREAMS') && <PaymentsColumn paymentsCount={paymentsCount} />}
    </Tr>
  );
}

export function RolesRowEdit({
  name,
  wearerAddress,
  editStatus,
  payments,
  handleRoleClick,
}: RoleEditProps) {
  const isRemovedRole = editStatus === EditBadgeStatus.Removed;
  return (
    <Tr
      sx={{
        td: { padding: '0.75rem', height: '4rem' },
        '&:hover': {
          '.edit-role-icon': { opacity: isRemovedRole ? 0 : 1 },
        },
      }}
      _hover={{ bg: 'neutral-3' }}
      _active={{ bg: 'neutral-2', border: '1px solid', borderColor: 'neutral-3' }}
      transition="all ease-out 300ms"
      onClick={!isRemovedRole ? handleRoleClick : undefined}
      cursor={!isRemovedRole ? 'pointer' : 'not-allowed'}
    >
      <RoleNameEditColumn
        roleName={name}
        editStatus={editStatus}
      />
      <MemberColumn wearerAddress={wearerAddress} />
      {isFeatureEnabled('STREAMS') && (
        <PaymentsColumn
          paymentsCount={payments?.filter(p => p.isStreaming()).length || undefined}
        />
      )}
    </Tr>
  );
}

export function RolesTable({
  handleRoleClick,
  hatsTree,
}: {
  handleRoleClick: (hatId: Address) => void;
  hatsTree: DecentTree;
}) {
  return (
    <Box
      overflow="hidden"
      borderRadius="0.75rem"
      border="1px solid"
      borderColor="white-alpha-08"
    >
      {hatsTree.roleHats.length && (
        <Table variant="unstyled">
          <RolesHeader />
          <Tbody
            sx={{
              tr: {
                transition: 'all ease-out 300ms',
                borderBottom: '1px solid',
                borderColor: 'white-alpha-08',
              },
              'tr:last-child': {
                borderBottom: 'none',
              },
            }}
          >
            {hatsTree.roleHats.map(role => (
              <RolesRow
                key={role.id.toString()}
                hatId={role.id}
                name={role.name}
                wearerAddress={role.wearer}
                handleRoleClick={handleRoleClick}
                paymentsCount={
                  role.payments === undefined
                    ? undefined
                    : role.payments.filter(p => p.isStreaming()).length || undefined
                }
              />
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
export function RolesEditTable({ handleRoleClick }: { handleRoleClick: (hatId: Hex) => void }) {
  const { hatsTree } = useRolesStore();
  const { values, setFieldValue } = useFormikContext<RoleFormValues>();
  if (hatsTree === undefined) {
    return <RoleCardLoading />;
  }
  if (hatsTree === null && !values.hats.length) {
    return <RoleCardNoRoles />;
  }
  return (
    <Box
      overflow="hidden"
      borderRadius="0.75rem"
      border="1px solid"
      borderColor="white-alpha-08"
    >
      <Table variant="unstyled">
        <RolesHeader />
        <Tbody
          sx={{
            tr: {
              transition: 'all ease-out 300ms',
              borderBottom: '1px solid',
              borderColor: 'white-alpha-08',
            },
            'tr:last-child': {
              borderBottom: 'none',
            },
          }}
        >
          {values.hats.map(role => (
            <RolesRowEdit
              key={role.id}
              name={role.name}
              wearerAddress={role.wearer}
              handleRoleClick={() => {
                setFieldValue('roleEditing', role);
                handleRoleClick(role.id);
              }}
              editStatus={role.editedRole?.status}
              payments={role.payments}
            />
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
