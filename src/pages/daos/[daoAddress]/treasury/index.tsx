import { Box, Divider, Flex, Grid, GridItem, Show } from '@chakra-ui/react';
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
import { useDecentModal } from '../../../../components/ui/modals/useDecentModal';
import PageHeader from '../../../../components/ui/page/Header/PageHeader';
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
  const openSendAsset = useDecentModal(ModalType.SEND_ASSETS);

  const hasAnyBalanceOfAnyFungibleTokens =
    assetsFungible.reduce((p, c) => p + BigInt(c.balance), 0n) > 0n;

  const showSendButton = canUserCreateProposal && hasAnyBalanceOfAnyFungibleTokens;
  const totalTransfers = transfers?.length || 0;
  const showLoadMoreTransactions = totalTransfers > shownTransactions && shownTransactions < 100;

  return (
    <Box>
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
      <Grid
        templateAreas={{
          base: `"assets"
          "transactions"`,
          lg: `"transactions assets"`,
        }}
        gap="1rem"
        gridTemplateColumns={{ base: `1fr`, lg: `minmax(1fr, 736px) 1fr` }}
      >
        <GridItem area="transactions">
          <TitledInfoBox
            title={t('titleTransactions')}
            titleTestId="title-transactions"
            bg="neutral-2"
            w="100%"
            subTitle={
              <Show below="lg">
                <Box px="1rem">
                  <PaginationCount
                    totalTransfers={totalTransfers}
                    shownTransactions={shownTransactions}
                    daoAddress={daoAddress}
                  />
                </Box>
              </Show>
            }
          >
            <Flex flexDir={{ base: 'column-reverse', lg: 'column' }}>
              <Transactions shownTransactions={shownTransactions} />
              <Show above="lg">
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
              </Show>
            </Flex>
          </TitledInfoBox>
          {showLoadMoreTransactions && (
            <PaginationButton onClick={() => setShownTransactions(prevState => prevState + 20)} />
          )}
        </GridItem>
        <GridItem area="assets">
          <TitledInfoBox
            title={t('titleAssets')}
            titleTestId="title-assets"
            bg={{ base: 'neutral-2', lg: 'none' }}
          >
            <Assets />
          </TitledInfoBox>
        </GridItem>
      </Grid>
    </Box>
  );
}
