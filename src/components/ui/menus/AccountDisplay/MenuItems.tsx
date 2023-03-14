import { MenuList } from '@chakra-ui/react';
import { Connect, Disconnect } from '@decent-org/fractal-ui';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useTranslation } from 'react-i18next';
import { useAccount, useDisconnect } from 'wagmi';
import { MenuItemButton } from './MenuItemButton';
import { MenuItemNetwork } from './MenuItemNetwork';
import { MenuItemWallet } from './MenuItemWallet';

export function MenuItems() {
  const { address: account } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
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
      {account && <MenuItemWallet />}
      <MenuItemNetwork />
      {!account && (
        <MenuItemButton
          testId="accountMenu-connect"
          label={t('connect')}
          Icon={Connect}
          onClick={openConnectModal}
        />
      )}
      {account && (
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
