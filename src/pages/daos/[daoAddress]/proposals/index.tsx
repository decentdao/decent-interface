import { Button, Flex, Show, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AddPlus } from '../../../../assets/theme/custom/icons/AddPlus';
import { TokenPlaceholder } from '../../../../assets/theme/custom/icons/TokenPlaceholder';
import Proposals from '../../../../components/Proposals';
import { ModalType } from '../../../../components/ui/modals/ModalProvider';
import { useFractalModal } from '../../../../components/ui/modals/useFractalModal';
import PageHeader from '../../../../components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useCanUserCreateProposal } from '../../../../hooks/utils/useCanUserSubmitProposal';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { AzoriusGovernance } from '../../../../types';

export default function ProposalsPage() {
  const { t } = useTranslation(['common', 'proposal', 'breadcrumbs']);
  const {
    governance,
    node: { daoAddress },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();
  const azoriusGovernance = governance as AzoriusGovernance;
  const delegate = useFractalModal(ModalType.DELEGATE);
  const wrapTokenOpen = useFractalModal(ModalType.WRAP_TOKEN);
  const unwrapTokenOpen = useFractalModal(ModalType.UNWRAP_TOKEN);

  const { canUserCreateProposal, canDelegate } = useCanUserCreateProposal();

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
