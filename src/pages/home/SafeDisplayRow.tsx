import { Flex, Image, Show, Spacer, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Address } from 'viem';
import { useSwitchChain } from 'wagmi';
import Avatar from '../../components/ui/page/Header/Avatar';
import { DAO_ROUTES } from '../../constants/routes';
import useAvatar from '../../hooks/utils/useAvatar';
import { createAccountSubstring } from '../../hooks/utils/useGetAccountName';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { getChainIdFromPrefix, getChainName, getNetworkIcon } from '../../utils/url';

interface SafeDisplayRowProps {
  network: string;
  address: Address;
  name: string | undefined;
  showAddress?: boolean;
  onClick?: () => void;
}

export function SafeDisplayRow({
  address,
  network,
  onClick,
  showAddress,
  name,
}: SafeDisplayRowProps) {
  const { addressPrefix } = useNetworkConfig();
  const navigate = useNavigate();

  const { switchChain } = useSwitchChain({
    mutation: {
      onSuccess: () => {
        navigate(DAO_ROUTES.dao.relative(network, address));
      },
    },
  });

  const { t } = useTranslation('dashboard');

  // if the safe name is an ENS name, let's attempt to get the avatar for that
  const avatarURL = useAvatar(name ?? '');

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
          color={name ? nameColor : 'neutral-6'}
          textStyle={showAddress ? 'labels-large' : 'body-large'}
        >
          {name || t('loadingFavorite')}
        </Text>
        {showAddress && <Text textStyle="body-large">{createAccountSubstring(address)}</Text>}
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
