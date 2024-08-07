import { Box, Flex, Icon, Image, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { PencilLine } from '@phosphor-icons/react';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Address, Hex, getAddress, zeroAddress } from 'viem';
import { useGetDAOName } from '../../../hooks/DAO/useGetDAOName';
import useAvatar from '../../../hooks/utils/useAvatar';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { DecentTree, useRolesState } from '../../../state/useRolesState';
import { getChainIdFromPrefix } from '../../../utils/url';
import EtherscanLink from '../../ui/links/EtherscanLink';
import Avatar from '../../ui/page/Header/Avatar';
import EditBadge from './EditBadge';
import { RoleCardLoading, RoleCardNoRoles } from './RolePageCard';
import {
  EditBadgeStatus,
  RoleEditProps,
  RoleFormValues,
  RoleProps,
  SablierPayroll,
  SablierVesting,
} from './types';

function RolesHeader() {
  const { t } = useTranslation(['roles']);
  return (
    <Thead
      sx={{
        th: {
          padding: '0.75rem',
        },
      }}
      bg="white-alpha-04"
    >
      <Tr
        textStyle="label-base"
        color="neutral-7"
      >
        <Th>{t('role')}</Th>
        <Th>{t('member')}</Th>
        <Th>{t('payroll')}</Th>
        <Th>{t('vesting')}</Th>
      </Tr>
    </Thead>
  );
}

function RoleNameColumn({ roleName }: { roleName: string }) {
  return (
    <Td>
      <Flex
        alignItems="center"
        justifyContent="space-between"
      >
        <Text
          textStyle="body-base"
          color="lilac-0"
        >
          {roleName}
        </Text>
      </Flex>
    </Td>
  );
}

function RoleNameEditColumn({
  roleName,
  editStatus,
}: {
  roleName: string;
  editStatus?: EditBadgeStatus;
}) {
  return (
    <Td>
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
  const { addressPrefix } = useNetworkConfig();
  const { daoName: accountDisplayName } = useGetDAOName({
    address: getAddress(wearerAddress || zeroAddress),
    chainId: getChainIdFromPrefix(addressPrefix),
  });
  const avatarURL = useAvatar(wearerAddress || zeroAddress);
  const { t } = useTranslation(['roles']);
  return (
    <Td>
      <Flex alignItems="center">
        {wearerAddress ? (
          <Avatar
            size="icon"
            address={wearerAddress}
            url={avatarURL}
          />
        ) : (
          <Box
            boxSize="3rem"
            borderRadius="100%"
            bg="white-alpha-04"
          />
        )}
        <Flex
          direction="column"
          ml="0.5rem"
        >
          <Text
            textStyle="body-base"
            color="white-0"
          >
            {wearerAddress ? accountDisplayName : t('unassigned')}
          </Text>
        </Flex>
      </Flex>
    </Td>
  );
}

function PayrollColumn({ payrollData }: { payrollData: SablierPayroll | undefined }) {
  const { t } = useTranslation(['daoCreate']);
  return (
    <Td>
      <Flex flexDir="column">
        {payrollData ? (
          <Box>
            <Flex
              alignItems="center"
              gap="0.25rem"
              my="0.5rem"
            >
              <Image
                src={payrollData.asset.iconUri}
                fallbackSrc="/images/coin-icon-default.svg"
                alt={payrollData.asset.symbol}
                w="1.25rem"
                h="1.25rem"
              />
              {payrollData.payrollAmount}
              <EtherscanLink
                color="white-0"
                _hover={{ bg: 'transparent' }}
                textStyle="body-base"
                padding={0}
                borderWidth={0}
                value={payrollData.asset.address}
                type="token"
                wordBreak="break-word"
              >
                {payrollData.asset.symbol}
              </EtherscanLink>
              <Text
                color="white-0"
                textStyle="body-base"
              >
                {'/'} {payrollData.payrollSchedule}
              </Text>
            </Flex>
          </Box>
        ) : (
          <Text
            textStyle="body-base"
            color="neutral-6"
          >
            {t('n/a')}
          </Text>
        )}
      </Flex>
    </Td>
  );
}

function VestingColumn({ vestingData }: { vestingData: SablierVesting | undefined }) {
  const { t } = useTranslation(['daoCreate']);
  return (
    <Td>
      {vestingData ? (
        <Box>
          <Flex
            textStyle="body-base"
            color="white-0"
            gap="0.25rem"
            alignItems="center"
            my="0.5rem"
          >
            <Image
              src={vestingData.asset.iconUri}
              fallbackSrc="/images/coin-icon-default.svg"
              alt={vestingData.asset.symbol}
              w="1.25rem"
              h="1.25rem"
            />
            {vestingData.vestingAmount}
            <EtherscanLink
              color="white-0"
              _hover={{ bg: 'transparent' }}
              textStyle="body-base"
              padding={0}
              borderWidth={0}
              value={vestingData.asset.address}
              type="token"
              wordBreak="break-word"
            >
              {vestingData.asset.symbol}
            </EtherscanLink>
            <Text>
              {t('after')} {vestingData.vestingSchedule}
            </Text>
          </Flex>
        </Box>
      ) : (
        <Text
          textStyle="body-base"
          color="neutral-6"
        >
          {t('n/a')}
        </Text>
      )}
    </Td>
  );
}

export function RolesRow({
  name,
  wearerAddress,
  payrollData,
  vestingData,
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
      <RoleNameColumn roleName={name} />
      <MemberColumn wearerAddress={wearerAddress} />
      <PayrollColumn payrollData={payrollData} />
      <VestingColumn vestingData={vestingData} />
    </Tr>
  );
}

export function RolesRowEdit({
  name,
  wearerAddress,
  editStatus,
  payrollData,
  vestingData,
  handleRoleClick,
}: RoleEditProps) {
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
      onClick={handleRoleClick}
    >
      <RoleNameEditColumn
        roleName={name}
        editStatus={editStatus}
      />
      <MemberColumn wearerAddress={wearerAddress} />
      <PayrollColumn payrollData={payrollData} />
      <VestingColumn vestingData={vestingData} />
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
                wearerAddress={role.wearer}
                handleRoleClick={handleRoleClick}
                {...role}
              />
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
export function RolesEditTable({ handleRoleClick }: { handleRoleClick: (hatId: Hex) => void }) {
  const { hatsTree } = useRolesState();
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
              wearerAddress={role.wearer}
              handleRoleClick={() => {
                setFieldValue('roleEditing', role);
                handleRoleClick(role.id);
              }}
              editStatus={role.editedRole?.status}
              {...role}
            />
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
