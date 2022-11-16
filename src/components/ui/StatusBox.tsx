import { Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ProposalState } from '../../providers/fractal/types/usul';

interface StatusBoxProps {
  state: ProposalState;
}
export default function StatusBox({ state }: StatusBoxProps) {
  const { t } = useTranslation('proposal');
  return (
    <Box
      px="12px"
      py="5px"
      bg="sand.700"
      borderRadius="7px"
      color="black"
    >
      {t(state)}
    </Box>
  );
}
