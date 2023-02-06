import { Box, Flex, Text } from '@chakra-ui/react';
import { ArrowDown } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import useAvatar from '../../../../hooks/utils/useAvatar';
import useDisplayName from '../../../../hooks/utils/useDisplayName';
import Avatar from '../../page/Header/Avatar';

export function NotConnected() {
  const { t } = useTranslation('menu');
  return (
    <Flex
      alignItems="center"
      gap="1"
    >
      <Text textStyle="text-sm-mono-medium">{t('connectWallet')}</Text>
      <ArrowDown />
    </Flex>
  );
}

export function Connected() {
  const { address: account } = useAccount();
  const { displayName: accountDisplayName } = useDisplayName(account);
  const avatarURL = useAvatar(account || null);

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
      <ArrowDown />
    </Flex>
  );
}

export function MenuButtonDisplay() {
  const { address: account } = useAccount();

  if (!account) {
    return <NotConnected />;
  }
  return <Connected />;
}
