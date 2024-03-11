import { Button, Show } from '@chakra-ui/react';
import { AddPlus } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ProposalTemplates from '../../../../components/ProposalTemplates';
import PageHeader from '../../../../components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../constants/routes';
import useSubmitProposal from '../../../../hooks/DAO/proposal/useSubmitProposal';
import { useFractal } from '../../../../providers/App/AppProvider';

export default function ProposalTemplatesPage() {
  const { t } = useTranslation();
  const {
    node: { daoAddress },
  } = useFractal();
  const { canUserCreateProposal } = useSubmitProposal();

  return (
    <>
      <PageHeader
        title={t('proposalTemplates', { ns: 'breadcrumbs' })}
        breadcrumbs={[
          {
            terminus: t('proposalTemplates', { ns: 'breadcrumbs' }),
            path: '',
          },
        ]}
      >
        {canUserCreateProposal && (
          <Link to={DAO_ROUTES.proposalTemplateNew.relative(daoAddress)}>
            <Button minW={0}>
              <AddPlus />
              <Show above="sm">{t('create')}</Show>
            </Button>
          </Link>
        )}
      </PageHeader>
      <ProposalTemplates />
    </>
  );
}
