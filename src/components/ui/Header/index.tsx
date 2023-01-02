import { Flex } from '@chakra-ui/react';
import { useWeb3Provider } from '../../../providers/Web3Data/hooks/useWeb3Provider';
import { AccountDisplay } from '../menus/AccountDisplay';
import { DAOSearch } from '../menus/DAOSearch';
import { FavoritesMenu } from '../menus/FavoritesMenu';

function Header() {
  const {
    state: { account },
  } = useWeb3Provider();
  return (
    <Flex
      h="full"
      w="full"
      justifyContent="space-between"
      px="0.5rem"
    >
      <DAOSearch />
      <Flex>
        {!!account && <FavoritesMenu />}
        <AccountDisplay />
      </Flex>
    </Flex>
  );
}

export default Header;
