import { Flex, Button, Text, Spacer, Hide } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DecentSignature } from '../../assets/theme/custom/icons/DecentSignature';
import { BASE_ROUTES } from '../../constants/routes';
import { useFractal } from '../../providers/App/AppProvider';
import { useDaoInfoStore } from '../../store/daoInfo/useDaoInfoStore';
import { MySafes } from './MySafes';

export default function HomePage() {
  const { safe } = useDaoInfoStore();
  const { action } = useFractal();
  const { t } = useTranslation('home');

  useEffect(() => {
    // @todo @dev Let's revisit this logic in future when state has been updated
    if (safe?.address) {
      action.resetSafeState();
    }
  }, [safe?.address, action]);

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
        mt="2.5rem"
      >
        <Text textStyle="heading-small">{t('mySafes')}</Text>
        <Spacer />
        <Link to={BASE_ROUTES.create}>
          <Button
            variant="secondary"
            size="sm"
            cursor="pointer"
          >
            <Text textStyle="labels-large">{t('createCTA')}</Text>
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
