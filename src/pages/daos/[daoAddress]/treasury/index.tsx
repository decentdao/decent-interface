import { Flex, Show, Hide, Text, Box } from '@chakra-ui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Assets } from '../../../../components/pages/DAOTreasury/components/Assets';
import {
  PaginationButton,
  PaginationCount,
  Transactions,
} from '../../../../components/pages/DAOTreasury/components/Transactions';
import { TitledInfoBox } from '../../../../components/ui/containers/TitledInfoBox';
import { ModalType } from '../../../../components/ui/modals/ModalProvider';
import { useFractalModal } from '../../../../components/ui/modals/useFractalModal';
import PageHeader from '../../../../components/ui/page/Header/PageHeader';
import Divider from '../../../../components/ui/utils/Divider';
import { CONTENT_MAXW } from '../../../../constants/common';
import { useCanUserCreateProposal } from '../../../../hooks/utils/useCanUserSubmitProposal';
import { useFractal } from '../../../../providers/App/AppProvider';

export default function Treasury() {
  const {
    node: { daoName, daoAddress },
    treasury: { assetsFungible, transfers },
  } = useFractal();
  const [shownTransactions, setShownTransactions] = useState(20);
  const { t } = useTranslation('treasury');
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const openSendAsset = useFractalModal(ModalType.SEND_ASSETS);

  const hasAnyBalanceOfAnyFungibleTokens =
    assetsFungible.reduce((p, c) => p + BigInt(c.balance), 0n) > 0n;

  const showSendButton = canUserCreateProposal && hasAnyBalanceOfAnyFungibleTokens;
  const totalTransfers = transfers?.count || 0;
  const showLoadMoreTransactions = totalTransfers > shownTransactions && shownTransactions < 100;

  return (
    <main>
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
        <Show above="lg">
          <Box width={{ base: '100%', xl: '55%' }}>
            <TitledInfoBox
              width={{ base: '100%' }}
              title={t('titleTransactions')}
              titleTestId="title-transactions"
              bg="neutral-2"
            >
              <Transactions shownTransactions={shownTransactions} />
              {totalTransfers > 0 && (
                <>
                  <Divider
                    variant="darker"
                    my="1rem"
                  />
                  <Box px={{ base: '1rem', lg: '1.5rem' }}>
                    <PaginationCount
                      totalTransfers={totalTransfers}
                      shownTransactions={shownTransactions}
                      daoAddress={daoAddress}
                    />
                  </Box>
                  <Divider
                    variant="darker"
                    my="1rem"
                  />
                </>
              )}
            </TitledInfoBox>
            {showLoadMoreTransactions && (
              <PaginationButton onClick={() => setShownTransactions(prevState => prevState + 20)} />
            )}
          </Box>
        </Show>
        <TitledInfoBox
          width={{ base: '100%', xl: '35%' }}
          title={t('titleAssets')}
          titleTestId="title-assets"
          bg={{ base: 'neutral-2', lg: 'none' }}
          overflowX={{ base: 'hidden', lg: 'scroll' }}
        >
          <Assets />
        </TitledInfoBox>
        <Hide above="lg">
          <Box
            mt="2rem"
            w="full"
          >
            <Text textStyle="display-lg">{t('titleTransactions')}</Text>
            <PaginationCount
              totalTransfers={totalTransfers}
              shownTransactions={shownTransactions}
              daoAddress={daoAddress}
            />
            <Box
              width="full"
              py="1rem"
              mt="1.25rem"
              borderRadius="0.75rem"
              bg="neutral-3"
              maxW={CONTENT_MAXW}
              overflowX="scroll"
            >
              <Transactions shownTransactions={shownTransactions} />
            </Box>
            {showLoadMoreTransactions && (
              <PaginationButton onClick={() => setShownTransactions(prevState => prevState + 20)} />
            )}
          </Box>
        </Hide>
      </Flex>
    </main>
  );
}
