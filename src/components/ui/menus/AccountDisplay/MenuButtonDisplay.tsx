import { Box, Flex, Text } from '@chakra-ui/react';
import { ArrowDown } from '@decent-org/fractal-ui';
import { useWeb3Provider } from '../../../../contexts/web3Data/hooks/useWeb3Provider';
import useAvatar from '../../../../hooks/utils/useAvatar';
import useDisplayName from '../../../../hooks/utils/useDisplayName';
import Avatar from '../../Header/Avatar';

export function NotConnected() {
  return (
    <Flex
      alignItems="center"
      gap="1"
    >
      <Text textStyle="text-base-mono-bold">Connect Wallet</Text>
      <ArrowDown />
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
      <ArrowDown />
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
