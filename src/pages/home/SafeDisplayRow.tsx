import { Flex, Image, Show, Spacer, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getAddress } from 'viem';
import { SafeMenuItemProps } from '../../components/ui/menus/SafesMenu/SafeMenuItem';
import Avatar from '../../components/ui/page/Header/Avatar';
import { DAO_ROUTES } from '../../constants/routes';
import { useGetDAOName } from '../../hooks/DAO/useGetDAOName';
import useAvatar from '../../hooks/utils/useAvatar';
import useDisplayName, { createAccountSubstring } from '../../hooks/utils/useDisplayName';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { getNetworkIcon } from '../../utils/url';

export function SafeDisplayRow({ address, onClick, showAddress }: SafeMenuItemProps) {
  const [networkPrefix, daoAddress] = address.split(':');
  const { daoName } = useGetDAOName({ address: getAddress(address) });
  const navigate = useNavigate();

  const { t } = useTranslation('dashboard');

  const { displayName: accountDisplayName } = useDisplayName(address);
  const avatarURL = useAvatar(accountDisplayName);

  const onClickNav = () => {
    if (onClick) onClick();
    navigate(DAO_ROUTES.dao.relative(networkPrefix, daoAddress));
  };

  const nameColor = showAddress ? 'neutral-7' : 'white-0';

  const networkConfig = useNetworkConfig();

  return (
    <Flex
      maxW="100%"
      p="1.5rem"
      my="0.5rem"
      gap="0.75rem"
      alignItems="center"
      onClick={onClickNav}
      bg="neutral-2"
      cursor="pointer"
      _hover={{
        bg: 'neutral-3',
        border: '1px solid',
        borderColor: 'neutral-4',
      }}
      borderRadius="0.5rem"
      border="1px solid"
      borderColor="transparent"
      _active={{ borderColor: 'neutral-4' }}
    >
      <Avatar
        size="lg"
        address={daoAddress}
        url={avatarURL}
      />
      <Flex flexDir="column">
        <Text
          color={daoName ? nameColor : 'neutral-6'}
          textStyle={showAddress ? 'label-base' : 'button-base'}
        >
          {daoName ?? t('loadingFavorite')}
        </Text>
        {showAddress && <Text textStyle="button-base">{createAccountSubstring(daoAddress)}</Text>}
      </Flex>

      <Spacer />

      {/* Network Icon */}
      <Flex gap="0.5rem">
        <Image src={getNetworkIcon(networkPrefix)} />
        <Show above="md">
          <Text>{networkConfig.chain.name}</Text>
        </Show>
      </Flex>
    </Flex>
  );
}
