import {
  Box,
  Button,
  Flex,
  Spacer,
  Text,
  Drawer,
  DrawerOverlay,
  DrawerHeader,
  DrawerContent,
  useDisclosure,
  DrawerBody,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FavoriteProps } from '../../components/ui/menus/FavoritesMenu/Favorite';
import Avatar from '../../components/ui/page/Header/Avatar';
import { BACKGROUND_SEMI_TRANSPARENT_2 } from '../../constants/common';
import { DAO_ROUTES } from '../../constants/routes';
import { useAccountFavorites } from '../../hooks/DAO/loaders/useFavorites';
import useDAOName from '../../hooks/DAO/useDAOName';
import useAvatar from '../../hooks/utils/useAvatar';
import useDisplayName from '../../hooks/utils/useDisplayName';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';

interface AllSafesDrawerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

function FavoriteRow({ address, network }: FavoriteProps) {
  const { daoRegistryName } = useDAOName({ address });
  const navigate = useNavigate();

  const { t } = useTranslation('home');

  const { displayName: accountDisplayName } = useDisplayName(address);
  const avatarURL = useAvatar(accountDisplayName);

  const onClickNav = () => navigate(DAO_ROUTES.dao.relative(network, address));

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
        data-testid="walletMenu-avatar"
      />
      <Text textStyle="button-base">
        {daoRegistryName ? daoRegistryName : t('loadingFavorite')}
      </Text>
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

function AllSafesDrawer({ isOpen, onClose }: AllSafesDrawerProps) {
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
        bg={BACKGROUND_SEMI_TRANSPARENT_2}
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

export function MySafes() {
  const { t } = useTranslation('home');
  const { favoritesList } = useAccountFavorites();
  const { addressPrefix } = useNetworkConfig();

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box>
      <Box
        w="full"
        bgColor="neutral-2"
        border="1px"
        borderColor="neutral-4"
        borderRadius="8px"
      >
        {/* SAFES HEADER (might be removed from design) */}
        <Box p="1rem 0.75rem">
          <Text
            color="neutral-7"
            textStyle="button-small"
          >
            {t('mySafes')}
          </Text>
        </Box>

        {/* SAFES CONTENT */}
        {favoritesList.length === 0 ? (
          <Flex
            justifyContent="center"
            p="1.5rem 1rem"
          >
            <Text
              textStyle="button-base"
              color="white-alpha-16"
            >
              {t('emptyFavorites', { ns: 'dashboard' })}
            </Text>
          </Flex>
        ) : (
          <Box>
            {favoritesList.slice(0, 5).map(favorite => (
              <FavoriteRow
                key={favorite}
                network={addressPrefix}
                address={favorite}
              />
            ))}
          </Box>
        )}
      </Box>

      {favoritesList.length > 5 && (
        <Flex
          justifyContent="center"
          p="1rem"
        >
          {/* TODO: This Button style should be made a variant in UI repo */}
          <Button
            variant="primary"
            bg={'neutral-3'}
            borderRadius="625rem"
            color={'lilac-0'}
            borderWidth="1px"
            borderColor="transparent"
            _hover={{ textDecoration: 'none', bg: 'neutral-4' }}
            _active={{ bg: 'neutral-3', borderColor: 'neutral-4' }}
            size={'sm'}
            p={'0.25rem 0.75rem'}
            width={'fit-content'}
            onClick={onOpen}
          >
            {t('viewAll')}
          </Button>
        </Flex>
      )}

      <AllSafesDrawer
        isOpen={isOpen}
        onClose={onClose}
        onOpen={onOpen}
      />
    </Box>
  );
}
