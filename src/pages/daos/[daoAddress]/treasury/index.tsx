'use client';

import { Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Assets } from '../../../../components/pages/DAOTreasury/components/Assets';
import { Transactions } from '../../../../components/pages/DAOTreasury/components/Transactions';
import { useTreasuryTotalBN } from '../../../../components/pages/DAOTreasury/hooks/useTreasuryTotalBN';
import { TitledInfoBox } from '../../../../components/ui/containers/TitledInfoBox';
import { ModalType } from '../../../../components/ui/modals/ModalProvider';
import { useFractalModal } from '../../../../components/ui/modals/useFractalModal';
import PageHeader from '../../../../components/ui/page/Header/PageHeader';
import ClientOnly from '../../../../components/ui/utils/ClientOnly';
import useSubmitProposal from '../../../../hooks/DAO/proposal/useSubmitProposal';
import { useFractal } from '../../../../providers/App/AppProvider';

export default function Treasury() {
  const {
    node: { daoName, daoAddress },
  } = useFractal();
  const { t } = useTranslation('treasury');
  const treasuryTotal = useTreasuryTotalBN();
  const { canUserCreateProposal } = useSubmitProposal();
  const showButton = canUserCreateProposal && !treasuryTotal.isZero();

  return (
    <ClientOnly>
      <PageHeader
        title={t('headerTitle', {
          ns: 'breadcrumbs',
          daoName,
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
    </ClientOnly>
  );
}
