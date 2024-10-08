import { Flex, Image, Show, Spacer, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getAddress } from 'viem';
import { useSwitchChain } from 'wagmi';
import { SafeMenuItemProps } from '../../components/ui/menus/SafesMenu/SafeMenuItem';
import Avatar from '../../components/ui/page/Header/Avatar';
import { DAO_ROUTES } from '../../constants/routes';
import { useGetDAOName } from '../../hooks/DAO/useGetDAOName';
import useAvatar from '../../hooks/utils/useAvatar';
import useDisplayName, { createAccountSubstring } from '../../hooks/utils/useDisplayName';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { getChainIdFromPrefix, getChainName, getNetworkIcon } from '../../utils/url';

export function SafeDisplayRow({ address, network, onClick, showAddress }: SafeMenuItemProps) {
  const { addressPrefix } = useNetworkConfig();
  const navigate = useNavigate();

  const { switchChain } = useSwitchChain({
    mutation: {
      onSuccess: () => {
        navigate(DAO_ROUTES.dao.relative(network, address));
      },
    },
  });

  const { daoName } = useGetDAOName({
    address: getAddress(address),
    chainId: getChainIdFromPrefix(network),
  });

  const { t } = useTranslation('dashboard');

  const { displayName: accountDisplayName } = useDisplayName(
    address,
    false,
    getChainIdFromPrefix(network),
  );
  const avatarURL = useAvatar(accountDisplayName);

  const onClickNav = () => {
    if (onClick) onClick();
    if (addressPrefix !== network) {
      switchChain({ chainId: getChainIdFromPrefix(network) });
    } else {
      navigate(DAO_ROUTES.dao.relative(network, address));
    }
  };

  const nameColor = showAddress ? 'neutral-7' : 'white-0';

  return (
    <Flex
      maxW="100%"
      p="1.5rem"
      my="0.5rem"
      gap="0.75rem"
      alignItems="center"
      onClick={onClickNav}
      backgroundColor="neutral-2"
      cursor="pointer"
      _hover={{
        backgroundColor: 'neutral-3',
        border: '1px solid',
        borderColor: 'neutral-4',
      }}
      transition="all ease-out 300ms"
      borderRadius="0.5rem"
      border="1px solid"
      borderColor="transparent"
      _active={{ borderColor: 'neutral-4' }}
    >
      <Avatar
        size="lg"
        address={address}
        url={avatarURL}
      />
      <Flex flexDir="column">
        <Text
          color={daoName ? nameColor : 'neutral-6'}
          textStyle={showAddress ? 'label-base' : 'button-base'}
        >
          {daoName ?? t('loadingFavorite')}
        </Text>
        {showAddress && <Text textStyle="button-base">{createAccountSubstring(address)}</Text>}
      </Flex>

      <Spacer />

      {/* Network Icon */}
      <Flex gap="0.5rem">
        <Image src={getNetworkIcon(network)} />
        <Show above="md">
          <Text>{getChainName(network)}</Text>
        </Show>
      </Flex>
    </Flex>
  );
}
