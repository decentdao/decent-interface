import { MenuList } from '@chakra-ui/react';
import { Connect, Disconnect } from '@decent-org/fractal-ui';
import { useWeb3Provider } from '../../../../providers/web3Data/hooks/useWeb3Provider';
import { MenuItemButton } from './MenuItemButton';
import { MenuItemNetwork } from './MenuItemNetwork';
import { MenuItemWallet } from './MenuItemWallet';

export function MenuItems() {
  const {
    connect,
    disconnect,
    state: { account },
  } = useWeb3Provider();
  return (
    <MenuList
      p="0"
      w="16.25rem"
      rounded="lg"
      shadow="menu-gold"
      mr={['auto', '1rem']}
      bg="grayscale.black"
      border="none"
      sx={{
        '& > :nth-of-type(1)': {
          borderTopRadius: 'lg',
        },
        '& > :last-child': {
          borderBottomRadius: 'lg',
        },
      }}
    >
      {account && <MenuItemWallet />}
      <MenuItemNetwork />
      {!account && (
        <MenuItemButton
          testId="accountMenu-connect"
          label="Connect"
          Icon={Connect}
          onClick={connect}
        />
      )}
      {account && (
        <MenuItemButton
          testId="accountMenu-disconnect"
          label="Disconnect"
          Icon={Disconnect}
          onClick={disconnect}
        />
      )}
    </MenuList>
  );
}
