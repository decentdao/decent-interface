import { Box, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ProposalState } from '../../providers/fractal/types/usul';

interface StatusBoxProps {
  state: ProposalState;
}
export default function StatusBox({ state }: StatusBoxProps) {
  const { t } = useTranslation('proposal');
  return (
    <Box
      px="8px"
      py="2px"
      bg="sand.700"
      borderRadius="7px"
      color="black"
    >
      <Text textStyle="text-sm-mono-semibold">{t(state)}</Text>
    </Box>
  );
}
