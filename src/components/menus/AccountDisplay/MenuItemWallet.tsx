import { Flex, Text } from '@chakra-ui/react';
import { Copy } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import useAvatar from '../../../hooks/useAvatar';
import useDisplayName from '../../../hooks/useDisplayName';
import { useCopyText } from '../../../hooks/utlities/useCopyText';
import Avatar from '../../ui/Header/Avatar';
import { MenuItem } from './MenuItem';

/**
 * Display to show a users connected wallet information
 * Allows for copying of address
 */
export function MenuItemWallet({}: {}) {
  const {
    state: { account },
  } = useWeb3Provider();
  const accountDisplayName = useDisplayName(account);
  const avatarURL = useAvatar(account);
  const copyTextToClipboard = useCopyText();
  const { t } = useTranslation('walletMenu');

  if (!account) {
    return null;
  }
  return (
    <MenuItem testId="accountMenu-wallet">
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
