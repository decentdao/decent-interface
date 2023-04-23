'use client';

import { Box, Button, Flex, Show, Text } from '@chakra-ui/react';
import { AddPlus, TokenPlaceholder } from '@decent-org/fractal-ui';
import Link from 'next/link';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Proposals from '../../../../src/components/Proposals';
import { ModalType } from '../../../../src/components/ui/modals/ModalProvider';
import { useFractalModal } from '../../../../src/components/ui/modals/useFractalModal';
import PageHeader from '../../../../src/components/ui/page/Header/PageHeader';
import ClientOnly from '../../../../src/components/ui/utils/ClientOnly';
import { DAO_ROUTES } from '../../../../src/constants/routes';
import { useFractal } from '../../../../src/providers/App/AppProvider';
import { AzoriusGovernance, StrategyType } from '../../../../src/types';

export default function ProposalsPage() {
  const { t } = useTranslation(['common', 'proposal', 'breadcrumbs']);
  const {
    governance,
    node: { daoAddress, safe },
    readOnly: { user },
  } = useFractal();
  const { type } = governance;
  const delegate = useFractalModal(ModalType.DELEGATE);
  const wrapTokenOpen = useFractalModal(ModalType.WRAP_TOKEN);
  const showDelegate = useMemo(() => {
    const azoriusGovernance = governance as AzoriusGovernance;
    if (type) {
      if (type === StrategyType.GNOSIS_SAFE_AZORIUS) {
        if (azoriusGovernance.votesToken && azoriusGovernance.votesToken.balance) {
          return azoriusGovernance.votesToken.balance.gt(0);
        }
      }
    }
    return false;
  }, [type, governance]);

  const showCreateButton = useMemo(
    () =>
      type === StrategyType.GNOSIS_SAFE_AZORIUS ? true : safe?.owners.includes(user.address || ''),
    [type, safe, user.address]
  );

  const showWrapTokenButton = useMemo(() => {
    const azoriusGovernance = governance as AzoriusGovernance;
    return !!azoriusGovernance.votesToken?.underlyingTokenData;
  }, [governance]);

  return (
    <ClientOnly>
      <Box>
        <PageHeader
          breadcrumbs={[
            {
              title: t('proposals', { ns: 'breadcrumbs' }),
              path: '',
            },
          ]}
          buttonVariant="secondary"
          buttonText={showDelegate ? t('delegate') : undefined}
          buttonClick={showDelegate ? delegate : undefined}
          buttonTestId="link-delegate"
        >
          {showWrapTokenButton && (
            <Button
              minW={0}
              onClick={wrapTokenOpen}
            >
              <Flex
                alignItems="center"
                h="full"
              >
                <TokenPlaceholder
                  boxSize="1.25rem"
                  mt="1"
                />
                <Text>
                  <Show above="sm">{t('wrapToken')}</Show>
                </Text>
              </Flex>
            </Button>
          )}
          {showCreateButton && (
            <Link href={DAO_ROUTES.proposalNew.relative(daoAddress)}>
              <Button minW={0}>
                <AddPlus />
                <Show above="sm">{t('create')}</Show>
              </Button>
            </Link>
          )}
        </PageHeader>
        <Proposals />
      </Box>
    </ClientOnly>
  );
}
