import { Flex } from '@chakra-ui/react';
import { DAOSearch } from '../../menus/DAOSearch';
import { AccountDisplay } from '../../menus/AccountDisplay';
import { FavoritesMenu } from '../../menus/FavoritesMenu';

function Header() {
  return (
    <Flex
      h="full"
      w="full"
      justifyContent="space-between"
      px="0.5rem"
    >
      <DAOSearch />
      <Flex
        alignItems="center"
        h="full"
        gap="8"
      >
        <FavoritesMenu />
        <AccountDisplay />
      </Flex>
    </Flex>
  );
}

export default Header;
