import { Flex } from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { AccountDisplay } from '../menus/AccountDisplay';
import { DAOSearch } from '../menus/DAOSearch';
import { FavoritesMenu } from '../menus/FavoritesMenu';

function Header() {
  const { address } = useAccount();
  return (
    <Flex
      h="full"
      w="full"
      justifyContent="space-between"
      px="0.5rem"
    >
      <DAOSearch />
      <Flex>
        {!!address && <FavoritesMenu />}
        <AccountDisplay />
      </Flex>
    </Flex>
  );
}

export default Header;
