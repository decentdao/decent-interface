import { Box, Flex } from '@chakra-ui/react';
import { DecentSignature } from '@decent-org/fractal-ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ExternalLink from '../components/ui/links/ExternalLink';
import { DAOSearch } from '../components/ui/menus/DAOSearch';
import { BASE_ROUTES } from '../constants/routes';
import { URL_DOCS } from '../constants/url';
import { useFractal } from '../providers/App/AppProvider';
import { MySafes } from './home/MySafes';

export default function HomePage() {
  const {
    node: { daoAddress },
    action,
  } = useFractal();

  const { t } = useTranslation('home');

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
      <DAOSearch />
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
