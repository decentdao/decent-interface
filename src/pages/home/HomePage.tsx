import { Flex, Button, Text, Spacer, Hide } from '@chakra-ui/react';
import { DecentSignature } from '@decent-org/fractal-ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BASE_ROUTES } from '../../constants/routes';
import { useFractal } from '../../providers/App/AppProvider';
import { MySafes } from './MySafes';

export default function HomePage() {
  const {
    node: { daoAddress },
    action,
  } = useFractal();

  const { t } = useTranslation('home');

  useEffect(() => {
    if (daoAddress) {
      action.resetSafeState();
    }
  }, [daoAddress, action]);

  return (
    <Flex
      direction="column"
      alignItems="center"
    >
      <Hide above="md">
        <DecentSignature
          mt="3rem"
          height="auto"
          width="8rem"
        />
      </Hide>
      <Flex
        w="100%"
        alignItems="flex-end"
        mt="3rem"
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
        mt="1.5rem"
      >
        <MySafes />
      </Flex>
    </Flex>
  );
}
