import { Flex, Image, Show, Spacer, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FavoriteProps } from '../../components/ui/menus/FavoritesMenu/Favorite';
import Avatar from '../../components/ui/page/Header/Avatar';
import { DAO_ROUTES } from '../../constants/routes';
import useDAOName from '../../hooks/DAO/useDAOName';
import useAvatar from '../../hooks/utils/useAvatar';
import useDisplayName from '../../hooks/utils/useDisplayName';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';

export function FavoriteRow({ address, network }: FavoriteProps) {
  const { daoRegistryName } = useDAOName({ address });
  const navigate = useNavigate();

  const { t } = useTranslation('home');

  const { displayName: accountDisplayName } = useDisplayName(address);
  const avatarURL = useAvatar(accountDisplayName);

  const onClickNav = () => navigate(DAO_ROUTES.dao.relative(network, address));

  const networkConfig = useNetworkConfig();

  return (
    <Flex
      maxW="100%"
      p="0.75rem"
      m="0.25rem"
      mb="0.75rem"
      gap="0.75rem"
      borderRadius="0.25rem"
      alignItems="center"
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
      />
      <Text textStyle="button-base">
        {daoRegistryName ? daoRegistryName : t('loadingFavorite')}
      </Text>

      <Spacer />

      {/* Network Icon */}
      <Flex gap="0.5rem">
        <Image src={networkConfig.nativeTokenIcon} />
        <Show above="md">
          <Text>{networkConfig.chain.name}</Text>
        </Show>
      </Flex>
    </Flex>
  );
}
