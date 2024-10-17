import { Flex, Image, Show, Spacer, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePublicClient, useSwitchChain } from 'wagmi';
import { SafeMenuItemProps } from '../../components/ui/menus/SafesMenu/SafeMenuItem';
import Avatar from '../../components/ui/page/Header/Avatar';
import { DAO_ROUTES } from '../../constants/routes';
import useAvatar from '../../hooks/utils/useAvatar';
import useDisplayName, { createAccountSubstring } from '../../hooks/utils/useDisplayName';
import {
  getSafeNameFallback,
  useGetAccountNameDeferred,
} from '../../hooks/utils/useGetAccountName';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { getChainIdFromPrefix, getChainName, getNetworkIcon } from '../../utils/url';

export function SafeDisplayRow({ address, network, onClick, showAddress }: SafeMenuItemProps) {
  const {
    addressPrefix,
    contracts: { fractalRegistry },
  } = useNetworkConfig();
  const navigate = useNavigate();

  const { switchChain } = useSwitchChain({
    mutation: {
      onSuccess: () => {
        navigate(DAO_ROUTES.dao.relative(network, address));
      },
    },
  });

  const publicClient = usePublicClient();

  const { getAccountName } = useGetAccountNameDeferred(getChainIdFromPrefix(network));
  const [safeName, setSafeName] = useState<string>();

  useEffect(() => {
    const fetchSafeName = async () => {
      setSafeName(
        await getAccountName(address, () =>
          getSafeNameFallback(address, fractalRegistry, publicClient),
        ),
      );
    };

    fetchSafeName();
  }, [address, getAccountName, fractalRegistry, publicClient]);

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
          color={safeName ? nameColor : 'neutral-6'}
          textStyle={showAddress ? 'label-base' : 'button-base'}
        >
          {safeName ?? t('loadingFavorite')}
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
