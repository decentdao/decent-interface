import { Flex, Text, Spacer, Show, Hide, Box } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DAOSearch } from '../../components/ui/menus/DAOSearch';
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
      mt="2.5rem"
    >
      {/* Mobile */}
      <Hide above="md">
        <Flex
          direction="column"
          w="100%"
          gap="1.5rem"
        >
          <DAOSearch />
          <Text textStyle="heading-small">{t('mySafes')}</Text>
        </Flex>
      </Hide>

      {/* Desktop */}
      <Show above="md">
        <Flex
          w="100%"
          alignItems="center"
        >
          <Text textStyle="heading-small">{t('mySafes')}</Text>
          <Spacer />
          <Box w="24rem">
            <DAOSearch />
          </Box>
        </Flex>
      </Show>

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
