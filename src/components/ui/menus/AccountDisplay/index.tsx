import { Button, Menu, MenuButton } from '@chakra-ui/react';
import { MenuButtonDisplay } from './MenuButtonDisplay';
import { MenuItems } from './MenuItems';

export function AccountDisplay() {
  return (
    <Menu>
      <Button
        as={MenuButton}
        variant="tertiary"
        data-testid="header-accountMenu"
        pr="1rem"
      >
        <MenuButtonDisplay />
      </Button>
      <MenuItems />
    </Menu>
  );
}
