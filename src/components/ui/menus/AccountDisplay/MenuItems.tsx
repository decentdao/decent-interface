import { MenuList } from '@chakra-ui/react';
import { Connect, Disconnect } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { useDisconnect } from 'wagmi';
import { useFractal } from '../../../../providers/App/AppProvider';
import { web3ModalInit } from '../../../../providers/NetworkConfig/web3modal-config';
import { MenuItemButton } from './MenuItemButton';
import { MenuItemNetwork } from './MenuItemNetwork';
import { MenuItemWallet } from './MenuItemWallet';

export default function MenuItems() {
  const {
    readOnly: { user },
  } = useFractal();
  const { disconnect } = useDisconnect();
  const { t } = useTranslation('menu');
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
          onClick={async () => {
            try {
              const web3Modal = web3ModalInit();
              await web3Modal.open();
            } catch (e) {
              console.error(e);
            }
          }}
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
