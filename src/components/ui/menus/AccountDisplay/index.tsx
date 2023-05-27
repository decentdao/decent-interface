import { Menu, MenuButton } from '@chakra-ui/react';
import { Fragment } from 'react';
import { MenuButtonDisplay } from './MenuButtonDisplay';
import { MenuItems } from './MenuItems';

export function AccountDisplay() {
  return (
    <Menu>
      <Fragment>
        <MenuButton
          data-testid="header-accountMenu"
          pr="1rem"
        >
          <MenuButtonDisplay />
        </MenuButton>
        <MenuItems />
      </Fragment>
    </Menu>
  );
}
