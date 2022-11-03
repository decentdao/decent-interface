import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ProposalsList from '../../components/Proposals/ProposalsList';
import { TextButton, SecondaryButton } from '../../components/ui/forms/Button';
import H1 from '../../components/ui/H1';

export function Governance() {
  const { t } = useTranslation(['common', 'proposal']);
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between">
        <H1>Proposals</H1>
        <div className="flex ml-auto mb-2 sm:mb-0 items-center sm:items-start">
          <Link to="delegate">
            <TextButton label={t('delegate')} />
          </Link>
          <Link to="new">
            <SecondaryButton label={t('createProposal', { ns: 'proposal' })} />
          </Link>
        </div>
      </div>
      <ProposalsList />
    </div>
  );
}
