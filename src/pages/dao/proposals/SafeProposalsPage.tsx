import * as amplitude from '@amplitude/analytics-browser';
import { Button, Flex, Show, Text } from '@chakra-ui/react';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AddPlus } from '../../../assets/theme/custom/icons/AddPlus';
import { TokenPlaceholder } from '../../../assets/theme/custom/icons/TokenPlaceholder';
import Proposals from '../../../components/Proposals';
import { ModalType } from '../../../components/ui/modals/ModalProvider';
import { useDecentModal } from '../../../components/ui/modals/useDecentModal';
import PageHeader from '../../../components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../constants/routes';
import { useCanUserCreateProposal } from '../../../hooks/utils/useCanUserSubmitProposal';
import { analyticsEvents } from '../../../insights/analyticsEvents';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { AzoriusGovernance, DecentGovernance, GovernanceType } from '../../../types';

export function SafeProposalsPage() {
  useEffect(() => {
    amplitude.track(analyticsEvents.ProposalsPageOpened);
  }, []);
  const { t } = useTranslation(['common', 'proposal', 'breadcrumbs']);
  const {
    governance,
    node: { daoAddress },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();
  const azoriusGovernance = governance as AzoriusGovernance;
  const delegate = useDecentModal(ModalType.DELEGATE);
  const wrapTokenOpen = useDecentModal(ModalType.WRAP_TOKEN);
  const unwrapTokenOpen = useDecentModal(ModalType.UNWRAP_TOKEN);
  const canDelegate = useMemo(() => {
    if (azoriusGovernance.type === GovernanceType.AZORIUS_ERC20) {
      const decentGovernance = azoriusGovernance as DecentGovernance;

      const lockedTokenBalance = decentGovernance?.lockedVotesToken?.balance;
      const hasLockedTokenBalance = lockedTokenBalance ? lockedTokenBalance > 0n : undefined;

      const votesTokenBalance = azoriusGovernance?.votesToken?.balance;
      const hasVotesTokenBalance = votesTokenBalance ? votesTokenBalance > 0n : undefined;
      return hasVotesTokenBalance || hasLockedTokenBalance;
    }
    return false;
  }, [azoriusGovernance]);
  const { canUserCreateProposal } = useCanUserCreateProposal();

  const showWrapTokenButton = !!azoriusGovernance.votesToken?.underlyingTokenData;
  const showUnWrapTokenButton =
    showWrapTokenButton &&
    !!azoriusGovernance.votesToken?.balance &&
    azoriusGovernance.votesToken.balance !== 0n;

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          {
            terminus: t('proposals', { ns: 'breadcrumbs' }),
            path: '',
          },
        ]}
        buttonProps={
          canDelegate
            ? { children: t('delegate'), onClick: delegate, variant: 'secondary' }
            : undefined
        }
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
        {canUserCreateProposal && daoAddress && (
          <Link to={DAO_ROUTES.proposalNew.relative(addressPrefix, daoAddress)}>
            <Button minW={0}>
              <AddPlus />
              <Show above="sm">{t('create')}</Show>
            </Button>
          </Link>
        )}
      </PageHeader>
      <Proposals />
    </div>
  );
}
