import { Box, Flex, Icon, useBreakpointValue, Text } from '@chakra-ui/react';
import { CaretDown } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import useAvatar from '../../../../hooks/utils/useAvatar';
import useDisplayName from '../../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../../providers/App/AppProvider';
import Avatar, { AvatarSize } from '../../page/Header/Avatar';

function ConnectWalletButton() {
  const { t } = useTranslation('menu');
  return (
    <Flex
      alignItems="center"
      gap="1"
    >
      {t('connectWallet')}
      <Icon
        as={CaretDown}
        boxSize="1.5rem"
      />
    </Flex>
  );
}

function WalletMenuButton() {
  const {
    readOnly: { user },
  } = useFractal();
  const account = user.address;
  const { displayName: accountDisplayName } = useDisplayName(account);
  const avatarURL = useAvatar(accountDisplayName);

  const iconSize = useBreakpointValue<AvatarSize>({ base: 'sm', md: 'icon' }) || 'sm';

  if (!account) {
    return null;
  }

  return (
    <Flex
      alignItems="center"
      gap={{base: "0.25rem", md: "0.75rem"}}
    >
      <Box>
        <Avatar
          address={account}
          url={avatarURL}
          size={iconSize}
        />
      </Box>
      <Text textStyle={{base: "label-small", md: "button-base"}} mb="1px" >{accountDisplayName}</Text>
      <Icon
        as={CaretDown}
        boxSize={{ base: '1rem', md: '1.5rem' }}
      />
    </Flex>
  );
}

export function AccountMenuButton() {
  const {
    readOnly: { user },
  } = useFractal();

  return user.address ? <WalletMenuButton /> : <ConnectWalletButton />;
}
