import ContentBox from '../ui/ContentBox';
import { PrimaryButton } from '../ui/forms/Button';

interface ProposalActionProps {
  label: string;
  btnLabel: string;
  pending: boolean;
  actionFunc: (...args: any | undefined) => void;
}

export function ProposalAction({ actionFunc, pending, label, btnLabel }: ProposalActionProps) {
  return (
    <ContentBox>
      <div className="flex justify-between items-center">
        <div className="text-gray-25">{label}</div>
        <PrimaryButton
          label={btnLabel}
          className="mr-0"
          onClick={actionFunc}
          disabled={pending}
        />
      </div>
    </ContentBox>
  );
}
