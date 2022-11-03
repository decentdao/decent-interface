import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ClaimToken from '../../components/Dao/ClaimToken';
import ProposalsList from '../../components/Proposals/ProposalsList';
import UsulProposalsList from '../../components/Proposals/UsulProposalsList';
import H1 from '../../components/ui/H1';
import { SecondaryButton, TextButton } from '../../components/ui/forms/Button';

export function Governance({ isGnosisDAO }: { isGnosisDAO?: boolean }) {
  const { t } = useTranslation(['common', 'proposal']);
  return (
    <div>
      {!isGnosisDAO && <ClaimToken />}
      <div className="flex flex-col sm:flex-row sm:justify-between">
        <H1>Proposals</H1>
        <div className="flex ml-auto mb-2 sm:mb-0 items-center sm:items-start">
          {!isGnosisDAO && (
            <Link to="delegate">
              <TextButton label={t('delegate')} />
            </Link>
          )}
          <Link to="proposals/new">
            <SecondaryButton label={t('createProposal', { ns: 'proposal' })} />
          </Link>
        </div>
      </div>
      {isGnosisDAO ? <UsulProposalsList /> : <ProposalsList />}
    </div>
  );
}
