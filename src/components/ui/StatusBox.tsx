import cx from 'classnames';
import { useTranslation } from 'react-i18next';
import useProposalStateStringKey from '../../hooks/useProposalStateStringKey';
import { ProposalState } from '../../providers/govenor/types';
import { ProposalState as UsulProposalState } from '../../providers/fractal/types/usul';

interface StatusBoxProps {
  status?: ProposalState;
}

function StatusBox({ status }: StatusBoxProps) {
  const proposalState = useProposalStateStringKey(status);

  const getStatusColors = () => {
    switch (status) {
      case ProposalState.Active:
        return 'bg-drab-500 text-gold-500';
      default:
        return 'border border-gray-50 text-gray-50 bg-gray-400';
    }
  };
  const { t } = useTranslation('proposal');
  return (
    <div className={cx('px-4 py-2 rounded-lg font-medium text-xs h-fit', getStatusColors())}>
      <div>{t(proposalState)}</div>
    </div>
  );
}

interface UsulStatusBoxProps {
  state: UsulProposalState;
}
export function UsulStatusBox({ state }: UsulStatusBoxProps) {
  const getStatusColors = () => {
    switch (state) {
      case UsulProposalState.Active:
        return 'bg-drab-500 text-gold-500';
      default:
        return 'border border-gray-50 text-gray-50 bg-gray-400';
    }
  };
  const { t } = useTranslation('proposal');
  return (
    <div className={cx('px-4 py-2 rounded-lg font-medium text-xs h-fit', getStatusColors())}>
      <div>{t(state)}</div>
    </div>
  );
}

export default StatusBox;
