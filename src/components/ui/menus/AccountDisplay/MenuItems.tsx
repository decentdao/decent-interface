import { MenuList } from '@chakra-ui/react';
import { Connect, Disconnect } from '@decent-org/fractal-ui';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useTranslation } from 'react-i18next';
import { useDisconnect } from 'wagmi';
import { useFractal } from '../../../../providers/App/AppProvider';
import { MenuItemButton } from './MenuItemButton';
import { MenuItemNetwork } from './MenuItemNetwork';
import { MenuItemWallet } from './MenuItemWallet';

export function MenuItems() {
  const {
    readOnly: { user },
  } = useFractal();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  const { t } = useTranslation('menu');

  const openWeb3Modal = () => {
    // Ugly hack to open web3Modal.
    // This problem is solved in Web3Modal v4+
    try {
      open();
    } catch (e) {
      console.error(e);
      try {
        open();
      } catch (err) {
        console.error(err)
      }
    }
  }
  
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
      {user.address && <MenuItemWallet />}
      <MenuItemNetwork />
      {!user.address && (
        <MenuItemButton
          testId="accountMenu-connect"
          label={t('connect')}
          Icon={Connect}
          onClick={openWeb3Modal}
        />
      )}
      {user.address && (
        <MenuItemButton
          testId="accountMenu-disconnect"
          label={t('disconnect')}
          Icon={Disconnect}
          onClick={disconnect}
        />
      )}
    </MenuList>
  );
}
