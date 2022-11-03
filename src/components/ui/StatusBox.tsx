import cx from 'classnames';
import { useTranslation } from 'react-i18next';
import { ProposalState } from '../../providers/fractal/types/usul';

interface StatusBoxProps {
  state: ProposalState;
}
export default function StatusBox({ state }: StatusBoxProps) {
  const getStatusColors = () => {
    switch (state) {
      case ProposalState.Active:
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
