'use client';

import { Box, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Assets } from '../../../../src/components/pages/DAOTreasury/components/Assets';
import { Transactions } from '../../../../src/components/pages/DAOTreasury/components/Transactions';
import { TitledInfoBox } from '../../../../src/components/ui/containers/TitledInfoBox';
import { ModalType } from '../../../../src/components/ui/modals/ModalProvider';
import { useFractalModal } from '../../../../src/components/ui/modals/useFractalModal';
import PageHeader from '../../../../src/components/ui/page/Header/PageHeader';
import ClientOnly from '../../../../src/components/ui/utils/ClientOnly';
import { useFractal } from '../../../../src/providers/App/AppProvider';

export default function Treasury() {
  const {
    readOnly: { user },
    treasury: { assetsFungible },
    node: { daoName, daoAddress },
  } = useFractal();
  const { t } = useTranslation('treasury');

  const showButton = user.votingWeight.gt(0) && assetsFungible.length > 0;

  return (
    <ClientOnly>
      <Box>
        <PageHeader
          title={t('headerTitle', {
            ns: 'breadcrumbs',
            daoName: daoName,
            subject: t('treasury', { ns: 'breadcrumbs' }),
          })}
          address={daoAddress ? daoAddress : undefined}
          breadcrumbs={[
            {
              terminus: t('treasury', { ns: 'breadcrumbs' }),
              path: '',
            },
          ]}
          buttonText={showButton ? t('buttonSendAssets') : undefined}
          buttonClick={useFractalModal(ModalType.SEND_ASSETS)}
          buttonTestId="link-send-assets"
        />
        <Flex
          mt="1rem"
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
    </ClientOnly>
  );
}
