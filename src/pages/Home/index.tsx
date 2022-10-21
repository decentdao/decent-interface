import { Flex, Text } from '@chakra-ui/react';
import { Button } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ContentBox from '../../components/ui/ContentBox';

function Home() {
  const { t } = useTranslation('daoCreate');
  return (
    <Flex
      flexDirection="column"
      h="full"
      p="8"
    >
      <Text textStyle="text-2xl-mono-bold">{t('createHead')}</Text>
      <ContentBox title={t('createSubhead')}>
        <Flex
          gap="4"
          alignItems="center"
          py="2"
          width="full"
          sx={{
            '& > a': {
              width: 'full',
            },
          }}
        >
          <Link to="/daos/new">
            <Button
              data-testid="home-linkCreate"
              size="lg"
              width="100%"
            >
              {t('buttonCreate')}
            </Button>
          </Link>
          <Link to="/daos">
            <Button
              variant="secondary"
              data-testid="home-linkFind"
              size="lg"
              width="full"
            >
              {t('buttonFind')}
            </Button>
          </Link>
        </Flex>
      </ContentBox>
    </Flex>
  );
}

export default Home;
