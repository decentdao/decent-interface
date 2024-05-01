import { Button, Menu, MenuButton } from '@chakra-ui/react';
import { AccountMenuButton } from './AccountMenuButton';
import { WalletMenu } from './WalletMenu';

export function AccountDisplay() {
  return (
    <Menu
      placement="bottom-end"
      offset={[0, 16]}
    >
      <Button
        as={MenuButton}
        variant="tertiary"
        data-testid="header-accountMenu"
        pr="1rem"
      >
        <AccountMenuButton />
      </Button>

      <WalletMenu />
    </Menu>
  );
}
