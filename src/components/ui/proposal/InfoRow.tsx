import { Flex, Text, Tooltip } from '@chakra-ui/react';
import DisplayTransaction from '../../ui/links/DisplayTransaction';

export default function InfoRow({
  property,
  value,
  txHash,
  tooltip,
}: {
  property: string;
  value?: string;
  txHash?: string | null;
  tooltip?: string;
}) {
  return (
    <Flex
      marginTop={4}
      justifyContent="space-between"
    >
      <Text
        textStyle="text-base-sans-regular"
        color="chocolate.200"
      >
        {property}
      </Text>
      {tooltip === undefined ? (
        txHash ? (
          <DisplayTransaction txHash={txHash} />
        ) : (
          <Text>{value}</Text>
        )
      ) : (
        <Tooltip label={tooltip}>
          {txHash ? <DisplayTransaction txHash={txHash} /> : <Text>{value}</Text>}
        </Tooltip>
      )}
    </Flex>
  );
}
