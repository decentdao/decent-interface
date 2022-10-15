import { Flex, Text } from '@chakra-ui/react';
import { MenuItem } from './MenuItem';

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
      data-testid={testId}
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
