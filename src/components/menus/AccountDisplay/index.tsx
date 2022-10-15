import { Menu, MenuButton } from '@chakra-ui/react';
import { Fragment } from 'react';
import { MeenuButtonDisplay } from './MenuButtonDisplay';
import { MenuItems } from './MenuItems';

export function AccountDisplay() {
  return (
    <Menu isLazy>
      <Fragment>
        <MenuButton
          w="9.9375rem"
          data-testid="header:account-menu"
        >
          <MeenuButtonDisplay />
        </MenuButton>
        <MenuItems />
      </Fragment>
    </Menu>
  );
}
