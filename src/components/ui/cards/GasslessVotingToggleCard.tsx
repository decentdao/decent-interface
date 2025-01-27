import { Box, Text, HStack, Switch, Flex, Icon } from '@chakra-ui/react';
import { WarningCircle } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { DETAILS_BOX_SHADOW } from '../../../constants/common';
import EtherscanLink from '../links/EtherscanLink';

interface GasslessVotingToggleCardProps {
  address?: string;
  balance?: string;
  isEnabled: boolean;
  onToggle: () => void;
}

export function GasslessVotingToggleCard({
  address = '0x01168475F8B9e46F710Ff3654cbD9405e8ADb421',
  balance = '0 ETH',
  isEnabled,
  onToggle,
}: GasslessVotingToggleCardProps) {
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
      <HStack
        justify="space-between"
        width="100%"
      >
        <Flex
          flexDirection="column"
          gap="0.25rem"
        >
          <Text textStyle="helper-text">{t('gasslessVotingLabel')}</Text>
          <Text
            textStyle="helper-text"
            color="neutral-7"
          >
            {t('gasslessVotingDescription')}
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

      <Text textStyle="body-small">
        {t('titleBalance', { ns: 'modals' })}:{' '}
        <Text
          as="span"
          color="lilac-0"
        >
          {balance}
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
