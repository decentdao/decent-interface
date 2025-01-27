import { Box, Text, HStack, Switch, Flex, Icon, Button } from '@chakra-ui/react';
import { GasPump, WarningCircle } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';
import { DETAILS_BOX_SHADOW } from '../../constants/common';
import EtherscanLink from './links/EtherscanLink';

interface GasslessVotingToggleProps {
  address?: Address;
  balance?: string;
  isEnabled: boolean;
  onToggle: () => void;
}

function GasslessVotingToggleContent({
  isEnabled,
  onToggle,
  address,
  isSettings,
}: GasslessVotingToggleProps & { isSettings?: boolean }) {
  const { t } = useTranslation('daoCreate');

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
              ? t('gasslessVotingLabelSettings', { ns: 'daoEdit' })
              : t('gasslessVotingLabel')}
          </Text>
          <Text
            textStyle={isSettings ? 'label-large' : 'helper-text'}
            color="neutral-7"
            w="17.25rem"
          >
            {isSettings
              ? t('gasslessVotingDescriptionSettings', { ns: 'daoEdit' })
              : t('gasslessVotingDescription')}
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

export function GasslessVotingToggleDAOCreate(props: GasslessVotingToggleProps) {
  const { t } = useTranslation('daoCreate');

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
    >
      <GasslessVotingToggleContent {...props} />

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
            {t('gasslessVotingGettingStarted')}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}

export function GasslessVotingToggleDAOSettings(props: GasslessVotingToggleProps) {
  const { t } = useTranslation('daoEdit');

  return (
    <Box
      py="1.5rem"
      gap="1.5rem"
      display="flex"
      flexDirection="column"
    >
      <GasslessVotingToggleContent
        {...props}
        isSettings
      />

      <Flex
        alignItems="center"
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
