import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ProposalState } from '../../../providers/fractal/types/usul';
import StatusBox from '../StatusBox';
import { Badge } from '../badges/Badge';

interface ProposalStateBoxProps {
  state: ProposalState;
}

export default function ProposalStateBox({ state }: ProposalStateBoxProps) {
  const { t } = useTranslation('proposal');

  return (
    <Badge
      size="base"
      labelKey={state}
    />
  );
  return (
    <StatusBox>
      <Text textStyle="text-sm-mono-semibold">{t(state)}</Text>
    </StatusBox>
  );
}
