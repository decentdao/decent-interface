import { Box, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/ui/Header/PageHeader';
import { InfoCard } from '../DaoDashboard/Info';
import { Assets } from './Assets';
import { Transactions } from './Transactions';

function Treasury() {
  const { t } = useTranslation('treasury');
  return (
    <Box
      py="1.5rem"
      px={{ sm: '1rem', xl: 'auto' }}
    >
      <PageHeader
        title={t('titleTreasury', { daoName: '' })}
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
        <InfoCard
          minWidth={{ sm: '100%', xl: '60%' }}
          title={t('titleTransactions')}
          titleTestId="title-transactions"
        >
          <Transactions />
        </InfoCard>
        <InfoCard
          minWidth={{ sm: '100%', xl: '30%' }}
          title={t('titleAssets')}
          titleTestId="title-assets"
        >
          <Assets />
        </InfoCard>
      </Flex>
    </Box>
  );
}
export default Treasury;
