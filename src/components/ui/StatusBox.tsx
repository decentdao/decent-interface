import cx from 'classnames';
import useProposalStateString from '../../hooks/useProposalStateString';
import { ProposalState } from '../../providers/govenor/types';

interface StatusBoxProps {
  status?: ProposalState;
}

function StatusBox({ status }: StatusBoxProps) {
  const proposalState = useProposalStateString(status);

  const getStatusColors = () => {
    switch (status) {
      case ProposalState.Active:
        return 'bg-drab-500 text-gold-500';
      default:
        return 'border border-gray-50 text-gray-50 bg-gray-400';
    }
  };
  return (
    <div className={cx('px-4 py-2 rounded-lg font-medium text-xs h-fit', getStatusColors())}>
      <div>{proposalState}</div>
    </div>
  );
}

export default StatusBox;
