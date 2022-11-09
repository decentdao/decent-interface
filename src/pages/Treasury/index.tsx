import { Box, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/ui/Header/PageHeader';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { Assets } from './Assets';
import { InfoBox } from './InfoBox';
import { Transactions } from './Transactions';

function Treasury() {
  const {
    gnosis: { daoName },
  } = useFractal();
  const { t } = useTranslation('treasury');
  return (
    <Box
      py="1.5rem"
      px={{ sm: '1rem', xl: 'auto' }}
    >
      <PageHeader
        title={t('titleTreasury', { daoName: daoName })}
        titleTestId={'title-treasury'}
        buttonText={t('buttonSendAssets')}
        buttonClick={undefined}
        buttonTestId="link-send-assets"
      />
      <Flex
        align="start"
        gap="1rem"
        flexWrap="wrap"
      >
        <InfoBox
          minWidth={{ sm: '100%', xl: '55%' }}
          title={t('titleTransactions')}
          titleTestId="title-transactions"
        >
          <Transactions />
        </InfoBox>
        <InfoBox
          minWidth={{ sm: '100%', xl: '35%' }}
          title={t('titleAssets')}
          titleTestId="title-assets"
        >
          <Assets />
        </InfoBox>
      </Flex>
    </Box>
  );
}
export default Treasury;
