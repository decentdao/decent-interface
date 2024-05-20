import { Box, Flex } from '@chakra-ui/react';
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

  const searchSafe = useFractalModal(ModalType.SEARCH_SAFE);

  useEffect(() => {
    // TODO is this needed here?
    if (daoAddress) {
      action.resetDAO();
    }
  }, [daoAddress, action]);

  return (
    <Flex
      direction="column"
      gap="1rem"
      alignItems="center"
    >
      <DecentSignature
        marginTop="2rem"
        height="auto"
        width="8rem"
      />

      {/* Extract into search safe component */}
      <Box
        color="neutral-5"
        p="0.5rem 1rem"
        w="full"
        borderColor="neutral-3"
        borderWidth="1px"
        borderRadius="0.25rem"
        _hover={{
          borderColor: 'neutral-4',
        }}
        onClick={searchSafe}
        cursor="pointer"
      >
        {t('searchDAOPlaceholder')}
      </Box>

      <Flex
        direction="column"
        w="full"
        gap="0.5rem"
      >
        <Link to={BASE_ROUTES.create}>
          <Box
            w="full"
            px="1rem"
            pt="2rem"
            pb="1rem"
            bgColor="neutral-3"
            border="1px"
            borderColor="neutral-4"
            borderRadius="8px"
          >
            {t('createCTA')}
          </Box>
        </Link>

        <MySafes />
      </Flex>
      <ExternalLink href={URL_DOCS}>{t('docsCTA')}</ExternalLink>
    </Flex>
  );
}
