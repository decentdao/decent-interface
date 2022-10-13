import { Flex, Box, Text } from '@chakra-ui/react';
import { ArrowDown } from '@decent-org/fractal-ui';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import useAvatar from '../../../hooks/useAvatar';
import useDisplayName from '../../../hooks/useDisplayName';
import Avatar from '../../ui/Header/Avatar';

export function NotConnected() {
  return (
    <Flex
      alignItems="center"
      gap="1"
    >
      <Text>Connect Wallet</Text>
      <ArrowDown />
    </Flex>
  );
}

export function Connected() {
  const {
    state: { account },
  } = useWeb3Provider();
  const accountDisplayName = useDisplayName(account);
  const avatarURL = useAvatar(account);

  if (!account) {
    return null;
  }

  return (
    <Flex>
      <Avatar
        address={account}
        url={avatarURL}
      />
      <Box>{accountDisplayName}</Box>
    </Flex>
  );
}

export function MeenuButtonDisplay() {
  const {
    state: { account },
  } = useWeb3Provider();

  if (!account) {
    return <NotConnected />;
  }
  return <Connected />;
}
