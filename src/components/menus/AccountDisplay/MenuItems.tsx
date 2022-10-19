import { MenuList } from '@chakra-ui/react';
import { Connect, Disconnect } from '@decent-org/fractal-ui';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
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
      w="14rem"
      rounded="lg"
      shadow={'0px 0px 48px rgba(250, 189, 46, 0.48)'}
      mr={['auto', '2rem']}
      className="menu-list"
      sx={{
        '& > :nth-child(1)': {
          borderTopRadius: 'lg',
        },
        '& > :last-child': {
          borderBottomRadius: 'lg',
        },
        '& > :nth-of-type(even)': {
          backgroundColor: 'grayscale.black',
        },
        '& > :nth-of-type(odd)': {
          backgroundColor: 'black.900',
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
