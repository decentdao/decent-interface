import { Box, Button, Flex, Text, useDisclosure } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useAccountFavorites } from '../../hooks/DAO/loaders/useFavorites';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { AllSafesDrawer } from './AllSafesDrawer';
import { SafeDisplayRow } from './SafeDisplayRow';

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
              <SafeDisplayRow
                key={favorite}
                network={addressPrefix}
                address={favorite}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* VIEW ALL BUTTON */}
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
