import { Box, Flex, Icon, Image, Text } from '@chakra-ui/react';
import { CaretCircleRight, CaretRight } from '@phosphor-icons/react';
import { formatDuration, intervalToDuration } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Address, getAddress, zeroAddress } from 'viem';
import useAvatar from '../../hooks/utils/useAvatar';
import { useCopyText } from '../../hooks/utils/useCopyText';
import { useGetAccountName } from '../../hooks/utils/useGetAccountName';
import {
  EditBadgeStatus,
  RoleEditProps,
  RoleProps,
  SablierPaymentFormValues,
} from '../../types/roles';
import { Card } from '../ui/cards/Card';
import EtherscanLink from '../ui/links/EtherscanLink';
import Avatar from '../ui/page/Header/Avatar';
import EditBadge from './EditBadge';

export function AvatarAndRoleName({
  wearerAddress,
  name,
  paymentsCount,
}: {
  wearerAddress: Address | undefined;
  name?: string;
  paymentsCount?: number;
}) {
  const { displayName } = useGetAccountName(wearerAddress);

  const avatarURL = useAvatar(wearerAddress || zeroAddress);
  const { t } = useTranslation(['roles']);
  const copyToClipboard = useCopyText();

  return (
    <Flex alignItems="center">
      {wearerAddress ? (
        <Avatar
          size="xl"
          address={getAddress(wearerAddress)}
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
          p="0.25rem 0.5rem"
          ml="-0.75rem"
          rounded="1rem"
          bg="neutral-3"
          color="lilac-0"
          _hover={{
            color: 'white-0',
            bg: 'neutral-4',
          }}
          cursor="pointer"
          maxW="fit-content"
          onClick={() => copyToClipboard(wearerAddress)}
        >
          {displayName ?? t('unassigned')}
        </Text>
        {paymentsCount !== undefined && (
          <Flex
            mt="1rem"
            gap="0.25rem"
          >
            <Text
              textStyle="button-small"
              color="neutral-7"
              alignSelf="center"
            >
              {t('activePayments')}
            </Text>
            <Box
              bg="celery--2"
              color="neutral-3"
              borderColor="neutral-3"
              borderWidth="2px"
              borderRadius="50%"
              w="1.25rem"
              h="1.25rem"
            >
              <Text
                textStyle="helper-text-small"
                lineHeight="1rem"
                align="center"
              >
                {paymentsCount}
              </Text>
            </Box>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}

function Payment({ payment }: { payment: SablierPaymentFormValues }) {
  const { t } = useTranslation(['roles']);
  const format = ['years', 'days', 'hours'];
  const endDate =
    payment.endDate &&
    payment.startDate &&
    formatDuration(
      intervalToDuration({
        start: payment.startDate,
        end: payment.endDate,
      }),
      { format },
    );
  const cliffDate =
    payment.startDate &&
    payment.cliffDate &&
    formatDuration(
      intervalToDuration({
        start: payment.startDate,
        end: payment.cliffDate,
      }),
      { format },
    );
  return (
    <Flex flexDir="column">
      <Box
        mt="0.25rem"
        ml="4rem"
      >
        <Text
          textStyle="button-small"
          color="neutral-7"
        >
          {t('payment')}
        </Text>
        <Flex
          textStyle="body-base"
          color="white-0"
          gap="0.25rem"
          alignItems="center"
          my="0.5rem"
        >
          <Image
            src={payment.asset?.logo}
            fallbackSrc="/images/coin-icon-default.svg"
            alt={payment.asset?.symbol}
            w="1.25rem"
            h="1.25rem"
          />
          {payment.amount?.value}
          <EtherscanLink
            color="white-0"
            _hover={{ bg: 'transparent' }}
            textStyle="body-base"
            padding={0}
            borderWidth={0}
            value={payment.asset?.address ?? null}
            type="token"
            wordBreak="break-word"
          >
            {payment.asset?.symbol}
          </EtherscanLink>
          <Flex
            flexDir="column"
            gap="0.25rem"
          >
            <Text>{endDate && `${t('after')} ${endDate}`}</Text>
          </Flex>
        </Flex>
        <Text>{cliffDate && `${t('cliff')} ${t('after')} ${cliffDate}`}</Text>
      </Box>
    </Flex>
  );
}

export function RoleCard({
  name,
  wearerAddress,
  isTermed,
  paymentsCount,
  handleRoleClick,
  isCurrentTermActive,
}: RoleProps) {
  return (
    <Card
      mb="1rem"
      cursor="pointer"
      onClick={handleRoleClick}
    >
      <Flex justifyContent="space-between">
        <AvatarAndRoleName
          wearerAddress={wearerAddress}
          name={name}
          paymentsCount={paymentsCount}
        />
        {isTermed && (
          <EditBadge editStatus={!isCurrentTermActive ? EditBadgeStatus.Inactive : undefined} />
        )}
      </Flex>
    </Card>
  );
}

export function RoleCardEdit({
  name,
  wearerAddress,
  payments,
  editStatus,
  handleRoleClick,
}: RoleEditProps) {
  const isRemovedRole = editStatus === EditBadgeStatus.Removed;
  return (
    <Card
      mb="1rem"
      onClick={!isRemovedRole ? handleRoleClick : undefined}
      cursor={!isRemovedRole ? 'pointer' : 'not-allowed'}
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
      {payments &&
        payments.map((payment, index) => (
          <Payment
            key={index}
            payment={payment}
          />
        ))}
    </Card>
  );
}

export function RoleCardShort({
  name,
  editStatus,
  handleRoleClick,
}: {
  name: string;
  editStatus?: EditBadgeStatus;
  handleRoleClick: () => void;
}) {
  return (
    <Card
      onClick={handleRoleClick}
      cursor="pointer"
      my="0.5rem"
      borderRadius="0.75rem"
    >
      <Flex justifyContent="space-between">
        <Text
          textStyle="display-lg"
          color="lilac-0"
        >
          {name}
        </Text>
        <Flex
          alignItems="center"
          gap="1rem"
        >
          <EditBadge editStatus={editStatus} />
          <Icon
            as={CaretCircleRight}
            color="lilac-0"
            boxSize="1.5rem"
          />
        </Flex>
      </Flex>
    </Card>
  );
}
