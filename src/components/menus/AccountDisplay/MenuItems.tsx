import { MenuList, MenuItem as ChakraMenuItem, Text, Flex, Box } from '@chakra-ui/react';
import { Connect, Copy, Disconnect } from '@decent-org/fractal-ui';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import useAvatar from '../../../hooks/useAvatar';
import useDisplayName from '../../../hooks/useDisplayName';
import { useChainData } from '../../../hooks/utlities/useChainData';
import { useCopyText } from '../../../hooks/utlities/useCopyText';
import Avatar from '../../ui/Header/Avatar';

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
    state: { chainId },
  } = useWeb3Provider();

  const { name, color } = useChainData(chainId);
  return (
    <MenuItem>
      <Flex
        direction="column"
        gap="2"
      >
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
            bg={color}
            rounded="full"
          ></Box>
          <Text>{name}</Text>
        </Flex>
      </Flex>
    </MenuItem>
  );
}

function MenuItemWallet({}: {}) {
  const {
    state: { account },
  } = useWeb3Provider();
  const accountDisplayName = useDisplayName(account);
  const avatarURL = useAvatar(account);
  const copyTextToClipboard = useCopyText();

  if (!account) {
    return null;
  }
  return (
    <MenuItem>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        w="full"
      >
        <Flex
          direction="column"
          gap="2"
        >
          <Text
            textStyle="text-sm-sans-regular"
            color="chocolate.100"
          >
            Wallet
          </Text>
          <Flex
            alignItems="center"
            gap="2"
            aria-label="copy address"
            data-testid="walletmenu:copy-address"
            onClick={() => copyTextToClipboard(account)}
            cursor="pointer"
          >
            <Text
              textStyle="text-base-mono-medium"
              color="grayscale.100"
            >
              {accountDisplayName}
            </Text>
            <Copy />
          </Flex>
        </Flex>
        <Avatar
          size="lg"
          address={account}
          url={avatarURL}
        />
      </Flex>
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
