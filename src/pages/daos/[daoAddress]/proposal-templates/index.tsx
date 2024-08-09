import { Button, Show } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AddPlus } from '../../../../assets/theme/custom/icons/AddPlus';
import ProposalTemplates from '../../../../components/ProposalTemplates';
import PageHeader from '../../../../components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useCanUserCreateProposal } from '../../../../hooks/utils/useCanUserSubmitProposal';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';

export default function ProposalTemplatesPage() {
  const { t } = useTranslation();
  const {
    node: { safe },
  } = useFractal();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const { addressPrefix } = useNetworkConfig();
  const daoAddress = safe?.address;

  return (
    <div>
      <PageHeader
        title={t('proposalTemplates', { ns: 'breadcrumbs' })}
        breadcrumbs={[
          {
            terminus: t('proposalTemplates', { ns: 'breadcrumbs' }),
            path: '',
          },
        ]}
      >
        {canUserCreateProposal && daoAddress && (
          <Link to={DAO_ROUTES.proposalTemplateNew.relative(addressPrefix, daoAddress)}>
            <Button minW={0}>
              <AddPlus />
              <Show above="sm">{t('create')}</Show>
            </Button>
          </Link>
        )}
      </PageHeader>
      <ProposalTemplates />
    </div>
  );
}
