import { Divider, MenuList } from '@chakra-ui/react';
import { Link, Plugs } from '@phosphor-icons/react';
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

  return (
    <MenuList
      w="16.25rem"
      rounded="lg"
      boxShadow="0px 1px 0px 0px var(--chakra-colors-neutral-1)"
      bg="rgba(38, 33, 42, 0.74)"
      border="1px solid"
      borderColor="neutral-3"
      sx={{
        '& > :nth-of-type(1)': {
          borderTopRadius: 'lg',
        },
        '& > :last-child': {
          borderBottomRadius: 'lg',
        },
      }}
    >
      {user.address && (
        <>
          <MenuItemWallet />
          <Divider color="neutral-3" />
        </>
      )}
      <MenuItemNetwork />
      <Divider color="neutral-3" />
      {!user.address && (
        <MenuItemButton
          testId="accountMenu-connect"
          label={t('connect')}
          Icon={Link}
          onClick={() => open()}
        />
      )}
      {user.address && (
        <MenuItemButton
          testId="accountMenu-disconnect"
          label={t('disconnect')}
          Icon={Plugs}
          onClick={disconnect}
        />
      )}
    </MenuList>
  );
}
