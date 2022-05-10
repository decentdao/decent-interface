import cx from "classnames";
import { ProposalState } from "../../contexts/daoData/useProposals";
import useProposalStateString from "../../hooks/useProposalStateString";

interface StatusBoxProps {
  status?: ProposalState;
}

const StatusBox = ({ status }: StatusBoxProps) => {
  const proposalState = useProposalStateString(status);

  const getStatusColors = () => {
    switch (status) {
      case ProposalState.Active:
        return "bg-drab-500 text-gold-500";
      default:
        return "border border-gray-50 text-gray-50 bg-gray-400";
    }
  };
  return (
    <div className={cx("px-2 py-0.5 rounded-full font-medium text-xs h-fit", getStatusColors())}>
      <div>{proposalState}</div>
    </div>
  );
};

export default StatusBox;
