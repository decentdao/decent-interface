import { Flex, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { DAONavigation } from '../../menus/DAONavigation';
import { AccountDisplay } from '../../menus/AccountDisplay';
import { StarOutline } from '@decent-org/fractal-ui';

function FavoriteLink() {
  return (
    <Link
      to="/favorites"
      data-testid="header-favoritesLink"
    >
      <Flex
        gap="2"
        alignItems="center"
      >
        <StarOutline color="gold.500" />
        <Text color="gold.500">Favorites</Text>
      </Flex>
    </Link>
  );
}

function Header() {
  return (
    <Flex
      h="full"
      w="full"
      justifyContent="space-between"
    >
      <DAONavigation />
      <Flex
        alignItems="center"
        h="full"
        gap="8"
      >
        <FavoriteLink />
        <AccountDisplay />
      </Flex>
    </Flex>
  );
}

export default Header;
