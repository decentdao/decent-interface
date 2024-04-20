import { Box, Flex, Icon } from '@chakra-ui/react';
import { CaretDown } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import useAvatar from '../../../../hooks/utils/useAvatar';
import useDisplayName from '../../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../../providers/App/AppProvider';
import Avatar from '../../page/Header/Avatar';

export function NotConnected() {
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

export function Connected() {
  const {
    readOnly: { user },
  } = useFractal();
  const account = user.address;
  const { displayName: accountDisplayName } = useDisplayName(account);
  const avatarURL = useAvatar(accountDisplayName);

  if (!account) {
    return null;
  }

  return (
    <Flex
      alignItems="center"
      gap="0.75rem"
    >
      <Box>
        <Avatar
          address={account}
          url={avatarURL}
        />
      </Box>
      {accountDisplayName}
      <Icon
        as={CaretDown}
        boxSize="1.5rem"
      />
    </Flex>
  );
}

export function MenuButtonDisplay() {
  const {
    readOnly: { user },
  } = useFractal();
  if (!user.address) {
    return <NotConnected />;
  }
  return <Connected />;
}
