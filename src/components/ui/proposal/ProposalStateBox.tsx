import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ProposalState } from '../../../providers/fractal/types/usul';
import StatusBox from '../StatusBox';

interface ProposalStateBoxProps {
  state: ProposalState;
}

export default function ProposalStateBox({ state }: ProposalStateBoxProps) {
  const { t } = useTranslation('proposal');

  return (
    <StatusBox>
      <Text textStyle="text-sm-mono-semibold">{t(state)}</Text>
    </StatusBox>
  );
}
