import { Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Assets } from '../../../../components/pages/DAOTreasury/components/Assets';
import { Transactions } from '../../../../components/pages/DAOTreasury/components/Transactions';
import { TitledInfoBox } from '../../../../components/ui/containers/TitledInfoBox';
import { ModalType } from '../../../../components/ui/modals/ModalProvider';
import { useFractalModal } from '../../../../components/ui/modals/useFractalModal';
import PageHeader from '../../../../components/ui/page/Header/PageHeader';
import { useCanUserCreateProposal } from '../../../../hooks/utils/useCanUserSubmitProposal';
import { useFractal } from '../../../../providers/App/AppProvider';

export default function Treasury() {
  const {
    node: { daoName, daoAddress },
    treasury: { assetsFungible },
  } = useFractal();
  const { t } = useTranslation('treasury');
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const openSendAsset = useFractalModal(ModalType.SEND_ASSETS);

  const hasAnyBalanceOfAnyFungibleTokens =
    assetsFungible.reduce((p, c) => p + BigInt(c.balance), 0n) > 0n;

  const showSendButton = canUserCreateProposal && hasAnyBalanceOfAnyFungibleTokens;

  return (
    <div>
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
        buttonText={showSendButton ? t('buttonSendAssets') : undefined}
        buttonClick={showSendButton ? openSendAsset : undefined}
        buttonTestId="link-send-assets"
      />
      <Flex
        mt="1rem"
        align="start"
        gap="1rem"
        flexWrap="wrap"
      >
        <TitledInfoBox
          width={{ sm: '100%', xl: '55%' }}
          title={t('titleTransactions')}
          titleTestId="title-transactions"
          bg="neutral-2"
        >
          <Transactions />
        </TitledInfoBox>
        <TitledInfoBox
          width={{ sm: '100%', xl: '35%' }}
          title={t('titleAssets')}
          titleTestId="title-assets"
        >
          <Assets />
        </TitledInfoBox>
      </Flex>
    </div>
  );
}
