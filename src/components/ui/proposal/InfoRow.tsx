import { Box, Text, Tooltip } from '@chakra-ui/react';
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
    <Box marginTop="1rem">
      <Text
        textStyle="body-base"
        color="neutral-7"
        w="full"
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
          {txHash ? <DisplayTransaction txHash={txHash} /> : <Text color="white-0">{value}</Text>}
        </Tooltip>
      )}
    </Box>
  );
}
