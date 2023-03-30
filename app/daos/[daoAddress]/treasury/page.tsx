'use client';

import { Box, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { Assets } from '../../../../src/components/pages/DAOTreasury/components/Assets';
import { Transactions } from '../../../../src/components/pages/DAOTreasury/components/Transactions';
import { TitledInfoBox } from '../../../../src/components/ui/containers/TitledInfoBox';
import { ModalType } from '../../../../src/components/ui/modals/ModalProvider';
import { useFractalModal } from '../../../../src/components/ui/modals/useFractalModal';
import PageHeader from '../../../../src/components/ui/page/Header/PageHeader';
import { useFractal } from '../../../../src/providers/App/AppProvider';
import { AzoriusGovernance, StrategyType } from '../../../../src/types';

export default function Treasury() {
  const {
    node: { safe },
    governance,
    treasury: { assetsFungible },
  } = useFractal();
  const { type } = governance;
  const azoriousGovernance = governance as AzoriusGovernance;
  const { owners } = safe || {};
  const { address: account } = useAccount();
  const { t } = useTranslation('treasury');
  const hasAssetBalance = assetsFungible.some(asset => parseFloat(asset.balance) > 0);

  const isOwnerOrDelegate =
    hasAssetBalance &&
    (type === StrategyType.GNOSIS_SAFE
      ? owners?.includes(account || '')
      : azoriousGovernance?.votesToken.votingWeight?.gt(0));

  const showButton = isOwnerOrDelegate && assetsFungible.length > 0;

  return (
    <Box>
      <PageHeader
        breadcrumbs={[
          {
            title: t('treasury', { ns: 'breadcrumbs' }),
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
  );
}
