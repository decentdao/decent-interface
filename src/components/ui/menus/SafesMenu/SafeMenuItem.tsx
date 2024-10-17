import { Box, Button, Flex, Image, MenuItem, Spacer, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Address } from 'viem';
import { usePublicClient, useSwitchChain } from 'wagmi';
import { DAO_ROUTES } from '../../../../constants/routes';
import useAvatar from '../../../../hooks/utils/useAvatar';
import useDisplayName from '../../../../hooks/utils/useDisplayName';
import { getSafeNameFallback, useGetAccountName } from '../../../../hooks/utils/useGetAccountName';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { getChainIdFromPrefix, getNetworkIcon } from '../../../../utils/url';
import Avatar from '../../page/Header/Avatar';

export interface SafeMenuItemProps {
  network: string;
  address: Address;
  showAddress?: boolean;
  onClick?: () => void;
}

export function SafeMenuItem({ address, network }: SafeMenuItemProps) {
  const navigate = useNavigate();
  const publicClient = usePublicClient();

  const {
    addressPrefix,
    contracts: { fractalRegistry },
  } = useNetworkConfig();
  const { switchChain } = useSwitchChain({
    mutation: {
      onSuccess: () => {
        navigate(DAO_ROUTES.dao.relative(network, address));
      },
    },
  });

  const { accountName: safeName } = useGetAccountName({
    address: address,
    chainId: getChainIdFromPrefix(network),
    getAccountNameFallback: () => getSafeNameFallback(address, fractalRegistry, publicClient),
  });

  const { displayName: accountDisplayName } = useDisplayName(
    address,
    false,
    getChainIdFromPrefix(network),
  );
  const avatarURL = useAvatar(accountDisplayName);

  const { t } = useTranslation('dashboard');

  const onClickNav = () => {
    if (addressPrefix !== network) {
      switchChain({ chainId: getChainIdFromPrefix(network) });
    } else {
      navigate(DAO_ROUTES.dao.relative(network, address));
    }
  };

  return (
    <Box px="0.25rem">
      <MenuItem
        as={Button}
        variant="tertiary"
        w="full"
        h="3rem"
        onClick={onClickNav}
        noOfLines={1}
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        gap={2}
      >
        <Avatar
          address={address}
          url={avatarURL}
        />
        <Flex flexDir="column">
          <Text
            color="white-0"
            textStyle="button-base"
          >
            {safeName ?? t('loadingFavorite')}
          </Text>
        </Flex>

        <Spacer />

        {/* Network Icon */}
        <Image src={getNetworkIcon(network)} />
      </MenuItem>
    </Box>
  );
}
