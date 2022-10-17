import { Flex, Text } from '@chakra-ui/react';
import { MenuItem } from './MenuItem';

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
  onClick: () => void;
}) {
  return (
    <MenuItem
      testId={testId}
      onClick={onClick}
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
        w="full"
      >
        <Text textStyle="text-base-mono-medium">{label}</Text>
        <Icon />
      </Flex>
    </MenuItem>
  );
}
