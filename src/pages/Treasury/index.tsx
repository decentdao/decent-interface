import { Box, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ModalType } from '../../components/modals/ModalProvider';
import { useFractalModal } from '../../components/modals/useFractalModal';
import PageHeader from '../../components/ui/Header/PageHeader';
import { TitledInfoBox } from '../../components/ui/containers/TitledInfoBox';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { Assets } from './components/Assets';
import { Transactions } from './components/Transactions';

function Treasury() {
  const {
    gnosis: { daoName },
    treasury: { assetsFungible },
  } = useFractal();
  const { t } = useTranslation('treasury');
  const showButton = assetsFungible.length > 0; // TODO also only show if the user is a DAO signer or delegated token holder..
  return (
    <Box
      py="1.5rem"
      px={{ sm: '1rem', xl: 'auto' }}
    >
      <PageHeader
        title={t('titleTreasury', { daoName: daoName })}
        titleTestId={'title-treasury'}
        buttonText={showButton ? t('buttonSendAssets') : undefined}
        buttonClick={useFractalModal(ModalType.SEND_ASSETS)}
        buttonTestId="link-send-assets"
      />
      <Flex
        align="start"
        gap="1rem"
        flexWrap="wrap"
      >
        <TitledInfoBox
          minWidth={{ sm: '100%', xl: '55%' }}
          title={t('titleTransactions')}
          titleTestId="title-transactions"
        >
          <Transactions />
        </TitledInfoBox>
        <TitledInfoBox
          minWidth={{ sm: '100%', xl: '35%' }}
          title={t('titleAssets')}
          titleTestId="title-assets"
        >
          <Assets />
        </TitledInfoBox>
      </Flex>
    </Box>
  );
}
export default Treasury;
