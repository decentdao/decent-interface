import { Flex, Spacer, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SafeMenuItemProps } from '../../components/ui/menus/SafesMenu/SafeMenuItem';
import Avatar from '../../components/ui/page/Header/Avatar';
import { DAO_ROUTES } from '../../constants/routes';
import useDAOName from '../../hooks/DAO/useDAOName';
import useAvatar from '../../hooks/utils/useAvatar';
import useDisplayName, { createAccountSubstring } from '../../hooks/utils/useDisplayName';

export function SafeDisplayRow({ address, network, onClick, showAddress }: SafeMenuItemProps) {
  const { daoRegistryName } = useDAOName({ address });
  const navigate = useNavigate();

  const { t } = useTranslation('dashboard');

  const { displayName: accountDisplayName } = useDisplayName(address);
  const avatarURL = useAvatar(accountDisplayName);

  const onClickNav = () => {
    if (onClick) onClick();
    navigate(DAO_ROUTES.dao.relative(network, address));
  };

  const nameColor = showAddress ? 'neutral-7' : 'white-0';

  return (
    <Flex
      maxW="100%"
      p="0.75rem"
      m="0.25rem"
      mb="0.75rem"
      gap="0.75rem"
      borderRadius="0.25rem"
      alignItems={showAddress ? 'center' : 'flex-start'}
      onClick={onClickNav}
      border="1px"
      borderColor="transparent"
      cursor="pointer"
      _hover={{ bgColor: 'neutral-3' }}
      // what colours to use??
      _active={{ borderColor: 'neutral-4' }}
    >
      <Avatar
        size="lg"
        address={address}
        url={avatarURL}
        data-testid="walletMenu-avatar"
      />
      <Flex
        flexDir="column"
        alignSelf="center"
      >
        <Text
          color={daoRegistryName ? nameColor : 'neutral-6'}
          textStyle={showAddress ? 'label-base' : 'button-base'}
        >
          {daoRegistryName ? daoRegistryName : t('loadingFavorite')}
        </Text>
        {showAddress && <Text textStyle="button-base">{createAccountSubstring(address)}</Text>}
      </Flex>

      <Spacer />
      {/* Network Icon?? */}
      {/* <Avatar
          size="icon"
          address={address}
          url={avatarURL}
        /> */}
    </Flex>
  );
}
