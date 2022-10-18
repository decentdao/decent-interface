import { MenuList, MenuItem as ChakraMenuItem, Text, Flex, Box } from '@chakra-ui/react';
import { Connect, Disconnect } from '@decent-org/fractal-ui';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';

function MenuItem({ onClick, children }: { onClick?: () => void; children: JSX.Element }) {
  return (
    <ChakraMenuItem
      cursor={!!onClick ? 'pointer' : 'default'}
      p="4"
      onClick={onClick}
    >
      {children}
    </ChakraMenuItem>
  );
}

function MenuItemButton({
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

function MenuItemNetwork({}: {}) {
  const {
    state: { network },
  } = useWeb3Provider();

  return (
    <MenuItem>
      <Flex direction="column">
        <Text
          textStyle="text-sm-sans-regular"
          color="chocolate.100"
        >
          Network
        </Text>
        <Flex
          alignItems="center"
          gap="2"
        >
          <Box
            w="4"
            h="4"
            bg="gold.300"
            rounded="full"
          ></Box>
          <Text>{network}</Text>
        </Flex>
      </Flex>
    </MenuItem>
  );
}

function MenuItemWallet({}: {}) {
  return (
    <MenuItem>
      <Box></Box>
    </MenuItem>
  );
}

export function MenuItems() {
  const {
    connect,
    disconnect,
    state: { account },
  } = useWeb3Provider();
  return (
    <MenuList
      w="14rem"
      rounded="lg"
      shadow={'0px 0px 48px rgba(250, 189, 46, 0.48)'}
      mr={['auto', '2rem']}
      className="menu-list"
      sx={{
        '& > :nth-child(1)': {
          borderTopRadius: 'lg',
        },
        '& > :last-child': {
          borderBottomRadius: 'lg',
        },
        '& > :nth-of-type(even)': {
          backgroundColor: 'grayscale.black',
        },
        '& > :nth-of-type(odd)': {
          backgroundColor: 'black.900',
        },
      }}
    >
      {account && <MenuItemWallet />}
      <MenuItemNetwork />
      {!account && (
        <MenuItemButton
          testId="menu:connect-button"
          label="Connect"
          Icon={Connect}
          onClick={connect}
        />
      )}
      {account && (
        <MenuItemButton
          testId="menu:disconnect-button"
          label="Disconnect"
          Icon={Disconnect}
          onClick={disconnect}
        />
      )}
    </MenuList>
  );
}
