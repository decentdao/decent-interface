'use client';

import { Button, Flex, Show, Text } from '@chakra-ui/react';
import { AddPlus, TokenPlaceholder } from '@decent-org/fractal-ui';
import Link from 'next/link';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Proposals from '../../../../src/components/Proposals';
import { ModalType } from '../../../../src/components/ui/modals/ModalProvider';
import { useFractalModal } from '../../../../src/components/ui/modals/useFractalModal';
import PageHeader from '../../../../src/components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../src/constants/routes';
import useSubmitProposal from '../../../../src/hooks/DAO/proposal/useSubmitProposal';
import { useFractal } from '../../../../src/providers/App/AppProvider';
import { AzoriusGovernance, DecentGovernance, GovernanceType } from '../../../../src/types';

export default function ProposalsPage() {
  const { t } = useTranslation(['common', 'proposal', 'breadcrumbs']);
  const {
    governance,
    node: { daoAddress },
  } = useFractal();
  const azoriusGovernance = governance as AzoriusGovernance;
  const delegate = useFractalModal(ModalType.DELEGATE);
  const wrapTokenOpen = useFractalModal(ModalType.WRAP_TOKEN);
  const unwrapTokenOpen = useFractalModal(ModalType.UNWRAP_TOKEN);
  const canDelegate = useMemo(() => {
    if (azoriusGovernance.type === GovernanceType.AZORIUS_ERC20) {
      const decentGovernance = azoriusGovernance as DecentGovernance;
      const hasLockedTokenBalance = decentGovernance?.lockedVotesToken?.balance?.gt(0);
      const hasVotesTokenBalance = azoriusGovernance?.votesToken?.balance?.gt(0);
      return hasVotesTokenBalance || hasLockedTokenBalance;
    }
    return false;
  }, [azoriusGovernance]);
  const { canUserCreateProposal } = useSubmitProposal();

  const showWrapTokenButton = !!azoriusGovernance.votesToken?.underlyingTokenData;
  const showUnWrapTokenButton =
    showWrapTokenButton &&
    !!azoriusGovernance.votesToken?.balance &&
    !azoriusGovernance.votesToken.balance.isZero();

  return (
    <>
      <PageHeader
        breadcrumbs={[
          {
            terminus: t('proposals', { ns: 'breadcrumbs' }),
            path: '',
          },
        ]}
        buttonVariant="secondary"
        buttonText={canDelegate ? t('delegate') : undefined}
        buttonClick={canDelegate ? delegate : undefined}
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
        {showUnWrapTokenButton && (
          <Button
            minW={0}
            onClick={unwrapTokenOpen}
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
                <Show above="sm">{t('unwrapToken')}</Show>
              </Text>
            </Flex>
          </Button>
        )}
        {canUserCreateProposal && (
          <Link href={DAO_ROUTES.proposalNew.relative(daoAddress)}>
            <Button minW={0}>
              <AddPlus />
              <Show above="sm">{t('create')}</Show>
            </Button>
          </Link>
        )}
      </PageHeader>
      <Proposals />
    </>
  );
}
