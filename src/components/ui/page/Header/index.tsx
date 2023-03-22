import { Flex, Show } from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import useClientSide from '../../../../hooks/utils/useClientSide';
import { AccountDisplay } from '../../menus/AccountDisplay';
import { DAOSearch } from '../../menus/DAOSearch';
import { FavoritesMenu } from '../../menus/FavoritesMenu';

function Header() {
  const { address: account } = useAccount();
  const isClientSide = useClientSide();
  return (
    <Flex
      h="full"
      w="full"
      justifyContent="space-between"
      px="0.5rem"
      alignItems="center"
    >
      <Show above="md">
        <DAOSearch />
      </Show>
      <Flex
        h="full"
        w="full"
        justifyContent="flex-end"
        alignItems="center"
      >
        {!!account && isClientSide && <FavoritesMenu />}
        {isClientSide && <AccountDisplay />}
      </Flex>
    </Flex>
  );
}

export default Header;
