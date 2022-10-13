import { Box, Menu, MenuButton, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ArrowDown } from '@decent-org/fractal-ui';
interface IDAONavigation {}

export function DAONavigation({}: IDAONavigation) {
  const [isVisible, setIsVisible] = useState(false);
  // @todo update menu items to include mapping of DAO tree

  useEffect(() => {
    // @todo update to only show when viewing a dao
    setIsVisible(true);
  }, []);

  if (!isVisible) {
    return <Box></Box>;
  }

  return (
    <Box
      minW="10rem"
      h="full"
    >
      <Menu>
        <MenuButton
          h="full"
          w="full"
        >
          <Box
            display="flex"
            gap="2"
            justifyContent="center"
            alignItems="center"
          >
            <Text>DAO Name</Text>
            <ArrowDown />
          </Box>
        </MenuButton>
      </Menu>
    </Box>
  );
}
