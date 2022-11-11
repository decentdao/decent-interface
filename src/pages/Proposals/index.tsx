import { Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ProposalsList from '../../components/Proposals/ProposalsList';
import H1 from '../../components/ui/H1';
import { TextButton, SecondaryButton } from '../../components/ui/forms/Button';
import { useDelegateModal } from '../../modals/modals';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { DAO_ROUTES } from '../../routes/constants';

export function Governance() {
  const { t } = useTranslation(['common', 'proposal']);
  const {
    gnosis: { safe },
  } = useFractal();
  const [modal, openModal] = useDelegateModal();
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between">
        <H1>Proposals</H1>
        <div className="flex ml-auto mb-2 sm:mb-0 items-center sm:items-start">
          <Link to={DAO_ROUTES.delegate.relative(safe.address)}>
            <TextButton label={t('delegate')} />
          </Link>
          <Button onClick={openModal}>{t('delegate')}</Button>
          {modal}
          <Link to="new">
            <SecondaryButton label={t('createProposal', { ns: 'proposal' })} />
          </Link>
        </div>
      </div>
      <ProposalsList />
    </div>
  );
}
