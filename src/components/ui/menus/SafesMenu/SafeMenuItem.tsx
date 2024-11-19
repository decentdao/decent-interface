import { Box, Button, Flex, Image, MenuItem, Spacer, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Address } from 'viem';
import { useSwitchChain } from 'wagmi';
import { DAO_ROUTES } from '../../../../constants/routes';
import useAvatar from '../../../../hooks/utils/useAvatar';
import { useGetSafeName } from '../../../../hooks/utils/useGetSafeName';
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

  const { addressPrefix } = useNetworkConfig();
  const { switchChain } = useSwitchChain({
    mutation: {
      onSuccess: () => {
        navigate(DAO_ROUTES.dao.relative(network, address));
      },
    },
  });

  const { getSafeName } = useGetSafeName(getChainIdFromPrefix(network));
  const [safeName, setSafeName] = useState<string>();

  useEffect(() => {
    getSafeName(address).then(setSafeName);
  }, [address, getSafeName]);

  // if by chance the safe name is an ENS name, let's attempt to get the avatar for that
  const avatarURL = useAvatar(safeName ?? '');

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
        rounded="0.75rem"
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
