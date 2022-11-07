import { Flex, MenuItem, Text } from '@chakra-ui/react';
import { Copy } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import useAvatar from '../../../hooks/useAvatar';
import useDisplayName from '../../../hooks/useDisplayName';
import { useCopyText } from '../../../hooks/utlities/useCopyText';
import Avatar from '../../ui/Header/Avatar';

/**
 * Display to show a users connected wallet information
 * Allows for copying of address
 */
export function MenuItemWallet() {
  const {
    state: { account },
  } = useWeb3Provider();
  const { displayName: accountDisplayName } = useDisplayName(account);
  const avatarURL = useAvatar(account);
  const copyTextToClipboard = useCopyText();
  const { t } = useTranslation('menu');

  if (!account) {
    return null;
  }
  return (
    <MenuItem
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
          <Flex
            alignItems="center"
            gap="2"
            aria-label="copy address"
            data-testid="walletmenu-copyAddress"
            onClick={() => copyTextToClipboard(account)}
            cursor="pointer"
          >
            <Text
              data-testid="walletMenu-accountDisplay"
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
