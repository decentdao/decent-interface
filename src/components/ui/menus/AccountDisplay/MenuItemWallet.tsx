import { Box, Flex, MenuItem, Text } from '@chakra-ui/react';
import { Copy } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import useAvatar from '../../../../hooks/utils/useAvatar';
import { useCopyText } from '../../../../hooks/utils/useCopyText';
import useDisplayName from '../../../../hooks/utils/useDisplayName';
import EtherscanLinkAddress from '../../EtherscanLinkAddress';
import Avatar from '../../Header/Avatar';

/**
 * Display to show a users connected wallet information
 * Allows for copying of address
 */
export function MenuItemWallet() {
  const { address: account } = useAccount();
  const { displayName: accountDisplayName } = useDisplayName(account);
  const avatarURL = useAvatar(account || null);
  const copyTextToClipboard = useCopyText();
  const { t } = useTranslation('menu');

  if (!account) {
    return null;
  }
  return (
    <Box
      data-testid="accountMenu-wallet"
      bg="black.900"
      cursor="default"
      p="1rem 1.5rem"
      borderBottomRadius="lg"
    >
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
            {t('wallet')}
          </Text>
          <MenuItem
            padding={0}
            alignItems="center"
            gap="2"
            aria-label="copy address"
            data-testid="walletmenu-copyAddress"
            onClick={() => copyTextToClipboard(account)}
            cursor="pointer"
          >
            <Text
              maxWidth="8rem"
              whiteSpace="nowrap"
              overflowX="hidden"
              textOverflow="ellipsis"
              data-testid="walletMenu-accountDisplay"
              textStyle="text-base-mono-medium"
              color="grayscale.100"
            >
              {accountDisplayName}
            </Text>
            <Copy boxSize="1.5rem" />
          </MenuItem>
        </Flex>
        <EtherscanLinkAddress address={account}>
          <Avatar
            size="lg"
            address={account}
            url={avatarURL}
            data-testid="walletMenu-avatar"
          />
        </EtherscanLinkAddress>
      </Flex>
    </Box>
  );
}
