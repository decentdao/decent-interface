import { Box, Button, MenuItem, Text } from '@chakra-ui/react';

/**
 * Used to display a simple clickable item to the menu.
 * This will contain a label to the left and the given icon on the right
 */
export function MenuItemButton({
  label,
  Icon,
  testId,
  onClick,
}: {
  testId: string;
  label: string;
  Icon: any;
  onClick?: () => void;
}) {
  return (
    <Box>
      <MenuItem
        as={Button}
        variant="tertiary"
        cursor="pointer"
        data-testid={testId}
        onClick={onClick}
        h="3rem"
        justifyContent="space-between"
        rightIcon={
          <Icon
            size="1.5rem"
            data-testid="walletMenu-avatar"
          />
        }
      >
        <Text textStyle="button-base">{label}</Text>
      </MenuItem>
    </Box>
  );
}
