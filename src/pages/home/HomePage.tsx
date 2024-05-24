import { Box, Flex, Button, Text, Spacer } from '@chakra-ui/react';
import { DecentSignature } from '@decent-org/fractal-ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ExternalLink from '../../components/ui/links/ExternalLink';
import { ModalType } from '../../components/ui/modals/ModalProvider';
import { useFractalModal } from '../../components/ui/modals/useFractalModal';
import { BASE_ROUTES } from '../../constants/routes';
import { URL_DOCS } from '../../constants/url';
import { useFractal } from '../../providers/App/AppProvider';
import { MySafes } from './MySafes';

export default function HomePage() {
  const {
    node: { daoAddress },
    action,
  } = useFractal();

  const { t } = useTranslation('home');

  const openSearchSafeModal = useFractalModal(ModalType.SEARCH_SAFE);

  useEffect(() => {
    if (daoAddress) {
      action.resetSafeState();
    }
  }, [daoAddress, action]);

  return (
    <Flex
      direction="column"
      gap="1.5rem"
      alignItems="center"
    >
      <DecentSignature
        marginTop="2rem"
        height="auto"
        width="8rem"
      />

      <Box
        as="button"
        color="neutral-5"
        p="0.5rem 1rem"
        w="full"
        borderColor="neutral-3"
        borderWidth="1px"
        borderRadius="0.25rem"
        _hover={{ borderColor: 'neutral-4' }}
        onClick={openSearchSafeModal}
        textAlign="start"
        cursor="text"
      >
        {t('searchDAOPlaceholder', { ns: 'dashboard' })}
      </Box>

      <Flex
        w="100%"
        alignItems="flex-end"
      >
        <Text textStyle="display-lg">{t('mySafes')}</Text>
        <Spacer />
        <Link to={BASE_ROUTES.create}>
          <Button
            variant="secondary"
            size="sm"
            cursor="pointer"
          >
            <Text textStyle="button-small">{t('createCTA')}</Text>
          </Button>
        </Link>
      </Flex>

      <Flex
        direction="column"
        w="full"
      >
        <MySafes />
      </Flex>
    </Flex>
  );
}
