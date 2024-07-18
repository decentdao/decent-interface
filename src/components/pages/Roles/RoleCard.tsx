import { Box, Flex, Icon, Image, Text } from '@chakra-ui/react';
import { CaretRight } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { getAddress, zeroAddress } from 'viem';
import { useGetDAOName } from '../../../hooks/DAO/useGetDAOName';
import useAvatar from '../../../hooks/utils/useAvatar';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { getChainIdFromPrefix } from '../../../utils/url';
import { Card } from '../../ui/cards/Card';
import EtherscanLink from '../../ui/links/EtherscanLink';
import Avatar from '../../ui/page/Header/Avatar';
import EditBadge from './EditBadge';
import { RoleEditProps, RoleProps, SablierPayroll, SablierVesting } from './types';

export function AvatarAndRoleName({
  wearerAddress,
  name,
}: {
  wearerAddress: string | undefined;
  name: string;
}) {
  const { addressPrefix } = useNetworkConfig();
  const { daoName: accountDisplayName } = useGetDAOName({
    address: getAddress(wearerAddress || zeroAddress),
    chainId: getChainIdFromPrefix(addressPrefix),
  });
  const avatarURL = useAvatar(wearerAddress || zeroAddress);
  const { t } = useTranslation(['roles']);

  return (
    <Flex alignItems="center">
      {wearerAddress ? (
        <Avatar
          size="xl"
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
        ml="1rem"
      >
        <Text
          textStyle="display-lg"
          color="white-0"
        >
          {name}
        </Text>
        <Text
          textStyle="button-small"
          color="neutral-7"
        >
          {wearerAddress ? accountDisplayName : t('unassigned')}
        </Text>
      </Flex>
    </Flex>
  );
}

function PayrollAndVesting({
  payrollData,
  vestingData,
}: {
  payrollData: SablierPayroll | undefined;
  vestingData: SablierVesting | undefined;
}) {
  const { t } = useTranslation(['roles']);
  return (
    <Flex flexDir="column">
      {payrollData && (
        <Box
          mt="1rem"
          ml="4rem"
        >
          <Text
            textStyle="button-small"
            color="neutral-7"
          >
            {t('payroll')}
          </Text>
          <Flex
            textStyle="body-base"
            color="white-0"
            gap="0.25rem"
            alignItems="center"
            my="0.5rem"
          >
            <Image
              src={payrollData.asset.logo}
              fallbackSrc="/images/coin-icon-default.svg"
              alt={payrollData.asset.symbol}
              w="1.25rem"
              h="1.25rem"
            />
            {payrollData.amount.value}
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
            <Text>
              {'/'} {payrollData.paymentFrequency}
            </Text>
          </Flex>
        </Box>
      )}
      {vestingData && (
        <Box
          mt="0.25rem"
          ml="4rem"
        >
          <Text
            textStyle="button-small"
            color="neutral-7"
          >
            {t('vesting')}
          </Text>
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
      )}
    </Flex>
  );
}

export function RoleCard({
  name,
  wearerAddress,
  payrollData,
  vestingData,
  editStatus,
  handleRoleClick,
  hatId,
}: RoleProps) {
  return (
    <Card
      mb="1rem"
      onClick={() => handleRoleClick(hatId)}
    >
      <Flex justifyContent="space-between">
        <AvatarAndRoleName
          wearerAddress={wearerAddress}
          name={name}
        />
        <Flex
          alignItems="center"
          gap="1rem"
        >
          <EditBadge editStatus={editStatus} />
          <Icon
            as={CaretRight}
            color="white-0"
          />
        </Flex>
      </Flex>
      <PayrollAndVesting
        payrollData={payrollData}
        vestingData={vestingData}
      />
    </Card>
  );
}

export function RoleCardEdit({
  name,
  wearerAddress,
  payrollData,
  vestingData,
  editStatus,
  handleRoleClick,
}: RoleEditProps) {
  return (
    <Card
      mb="1rem"
      onClick={handleRoleClick}
    >
      <Flex justifyContent="space-between">
        <AvatarAndRoleName
          wearerAddress={wearerAddress}
          name={name}
        />
        <Flex
          alignItems="center"
          gap="1rem"
        >
          <EditBadge editStatus={editStatus} />
          <Icon
            as={CaretRight}
            color="white-0"
          />
        </Flex>
      </Flex>
      <PayrollAndVesting
        payrollData={payrollData}
        vestingData={vestingData}
      />
    </Card>
  );
}
