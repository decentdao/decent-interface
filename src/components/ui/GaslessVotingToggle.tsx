import { Box, Text, HStack, Switch, Flex, Icon, Button } from '@chakra-ui/react';
import { GasPump, WarningCircle } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';
import { DETAILS_BOX_SHADOW } from '../../constants/common';
import { isFeatureEnabled } from '../../helpers/featureFlags';
import EtherscanLink from './links/EtherscanLink';
import Divider from './utils/Divider';

interface GaslessVotingToggleProps {
  address?: Address;
  balance?: string;
  isEnabled: boolean;
  onToggle: () => void;
}

function GaslessVotingToggleContent({
  isEnabled,
  onToggle,
  address,
  isSettings,
}: GaslessVotingToggleProps & { isSettings?: boolean }) {
  const { t } = useTranslation('daoCreate');

  // @todo: Remove this once we have a real address
  if (!address) address = '0x01168475F8B9e46F710Ff3654cbD9405e8ADb421';

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="1.5rem"
      w="100%"
    >
      <HStack
        justify="space-between"
        width="100%"
        alignItems="flex-start"
      >
        <Flex
          flexDirection="column"
          gap="0.25rem"
        >
          <Text textStyle={isSettings ? 'heading-small' : 'helper-text'}>
            {isSettings
              ? t('gaslessVotingLabelSettings', { ns: 'daoEdit' })
              : t('gaslessVotingLabel')}
          </Text>
          <Text
            textStyle={isSettings ? 'label-large' : 'helper-text'}
            color="neutral-7"
            w="17.25rem"
          >
            {isSettings
              ? t('gaslessVotingDescriptionSettings', { ns: 'daoEdit' })
              : t('gaslessVotingDescription')}
          </Text>
        </Flex>
        <Switch
          size="md"
          isChecked={isEnabled}
          onChange={() => onToggle()}
          variant="secondary"
        />
      </HStack>

      {address && (
        <Box
          borderRadius="0.75rem"
          border="1px solid"
          borderColor="neutral-3"
          p="1rem 0.5rem"
          w="100%"
        >
          <EtherscanLink
            type="address"
            value={address}
            isTextLink
          >
            <Text as="span">{address}</Text>
          </EtherscanLink>
        </Box>
      )}
    </Box>
  );
}

export function GaslessVotingToggleDAOCreate(props: GaslessVotingToggleProps) {
  const { t } = useTranslation('daoCreate');

  if (!isFeatureEnabled('flag_gasless_voting')) return null;

  return (
    <Box
      borderRadius="0.75rem"
      bg="neutral-2"
      p="1.5rem"
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      gap="1.5rem"
      boxShadow={DETAILS_BOX_SHADOW}
      mt={2}
    >
      <GaslessVotingToggleContent {...props} />

      <Text textStyle="body-small">
        {t('titleBalance', { ns: 'modals' })}:{' '}
        <Text
          as="span"
          color="neutral-7"
        >
          {props.balance || '0 ETH'}
        </Text>
      </Text>
      <Box
        p="1rem"
        bg="neutral-3"
        borderRadius="0.75rem"
      >
        <Flex alignItems="center">
          <Icon
            as={WarningCircle}
            color="lilac-0"
            width="1.5rem"
            height="1.5rem"
          />
          <Text
            color="lilac-0"
            marginLeft="1rem"
          >
            {t('gaslessVotingGettingStarted')}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}

export function GaslessVotingToggleDAOSettings(props: GaslessVotingToggleProps) {
  const { t } = useTranslation('daoEdit');

  if (!isFeatureEnabled('flag_gasless_voting')) return null;

  return (
    <Box
      gap="1.5rem"
      display="flex"
      flexDirection="column"
    >
      <Divider
        my="1rem"
        w={{ base: 'calc(100% + 1.5rem)', md: 'calc(100% + 3rem)' }}
        mx={{ base: '-0.75rem', md: '-1.5rem' }}
      />

      <GaslessVotingToggleContent
        {...props}
        isSettings
      />

      <Flex
        mt="-0.55rem"
        justifyContent="space-between"
      >
        <Text textStyle="body-small">
          {t('titleBalance', { ns: 'modals' })}:{' '}
          <Text
            as="span"
            color="neutral-7"
          >
            {props.balance || '0 ETH'}
          </Text>
        </Text>
        <Button
          variant="secondary"
          leftIcon={<Icon as={GasPump} />}
        >
          {t('addGas')}
        </Button>
      </Flex>
    </Box>
  );
}
