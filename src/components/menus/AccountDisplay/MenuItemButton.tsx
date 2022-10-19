import { Flex, Text, MenuItem } from '@chakra-ui/react';
import { Fragment } from 'react';

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
    <Fragment>
      <MenuItem
        cursor="pointer"
        p="4"
        data-testid={testId}
        onClick={onClick}
        border="1px solid"
        borderColor="chocolate.700"
        _hover={{
          bg: 'chocolate.900',
        }}
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
    </Fragment>
  );
}
