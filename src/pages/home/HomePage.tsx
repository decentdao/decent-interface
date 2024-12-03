import { Flex, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
      <Flex
        w="100%"
        alignItems="flex-end"
        mt="2.5rem"
      >
        <Text textStyle="heading-small">{t('mySafes')}</Text>
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
