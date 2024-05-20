import {
  Box,
  Text,
  Drawer,
  DrawerOverlay,
  DrawerHeader,
  DrawerContent,
  DrawerBody,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../constants/common';
import { useAccountFavorites } from '../../hooks/DAO/loaders/useFavorites';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { FavoriteRow } from './FavoriteRow';

interface AllSafesDrawerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function AllSafesDrawer({ isOpen, onClose }: AllSafesDrawerProps) {
  const { addressPrefix } = useNetworkConfig();
  const { favoritesList } = useAccountFavorites();

  const { t } = useTranslation('home');

  const [drawerFullHeight, setDrawerFullHeight] = useState(false);

  return (
    <Drawer
      isOpen={isOpen}
      placement="bottom"
      onClose={() => {
        setDrawerFullHeight(false);
        onClose();
      }}
      size="md"
      isFullHeight={drawerFullHeight}
    >
      <DrawerOverlay
        bg={BACKGROUND_SEMI_TRANSPARENT}
        backdropFilter="auto"
        backdropBlur="10px"
      />
      <DrawerContent
        bg="neutral-2"
        borderTopRadius="0.5rem"
        maxH={drawerFullHeight ? 'calc(100vh - 4rem)' : '50%'}
        transitionDuration="300ms"
        transitionProperty="all"
        transitionTimingFunction="ease-out"
      >
        <DrawerHeader>
          <Box>
            <Box
              mx="calc(50% - 16px)"
              mb="1rem"
              width="32px"
              h="5px"
              bg="white-alpha-16"
              borderRadius="625rem"
            />
            <Text
              color="neutral-7"
              textStyle="button-small"
            >
              {t('mySafes')}
            </Text>
          </Box>
        </DrawerHeader>
        <DrawerBody
          onScroll={() => setDrawerFullHeight(true)}
          padding="0"
        >
          {favoritesList.map(favorite => (
            <FavoriteRow
              key={favorite}
              network={addressPrefix}
              address={favorite}
            />
          ))}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
