import { Box, Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import useAvatar from '../../../../hooks/utils/useAvatar';
import useDisplayName from '../../../../hooks/utils/useDisplayName';
import { useWeb3Provider } from '../../../../providers/Web3Data/hooks/useWeb3Provider';
import Avatar from '../../Header/Avatar';
import DownArrow from '../../svg/DownArrow';

export function NotConnected() {
  const { t } = useTranslation('menu');
  return (
    <Flex
      alignItems="center"
      gap="1"
    >
      <Text textStyle="text-sm-mono-medium">{t('connectWallet')}</Text>
      <DownArrow />
    </Flex>
  );
}

export function Connected() {
  const {
    state: { account },
  } = useWeb3Provider();
  const { displayName: accountDisplayName } = useDisplayName(account);
  const avatarURL = useAvatar(account);

  if (!account) {
    return null;
  }

  return (
    <Flex
      alignItems="center"
      gap="0.75rem"
      color="grayscale.100"
    >
      <Box mt="0.125rem">
        <Avatar
          address={account}
          url={avatarURL}
        />
      </Box>
      <Text textStyle="text-sm-mono-semibold">{accountDisplayName}</Text>
      <DownArrow />
    </Flex>
  );
}

export function MenuButtonDisplay() {
  const {
    state: { account },
  } = useWeb3Provider();

  if (!account) {
    return <NotConnected />;
  }
  return <Connected />;
}
