import { Text } from '@chakra-ui/react';
import useDisplayName from '../../../hooks/utils/useDisplayName';

export function ActivityAddress({ address, addComma }: { address: string; addComma: boolean }) {
  const { displayName } = useDisplayName(address);
  return (
    <Text>
      {displayName}
      {addComma && ', '}
    </Text>
  );
}
