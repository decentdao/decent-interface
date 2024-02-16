import { Menu, MenuButton } from '@chakra-ui/react';
import { Fragment } from 'react';
import { MenuButtonDisplay } from './MenuButtonDisplay';
import MenuItems from './MenuItems';

function AccountDisplay() {
  return (
    <Menu>
      <Fragment>
        <MenuButton
          data-testid="header-accountMenu"
          pr="1rem"
          _hover={{ color: 'gold.200' }}
        >
          <MenuButtonDisplay />
        </MenuButton>
        <MenuItems />
      </Fragment>
    </Menu>
  );
}

export default AccountDisplay;
