import { Box, Text } from '@chakra-ui/react';
import DisplayTransaction from '../../ui/links/DisplayTransaction';
import { DecentTooltip } from '../DecentTooltip';

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
          <DisplayTransaction
            isTextLink
            txHash={txHash}
          />
        ) : (
          <Text>{value}</Text>
        )
      ) : (
        <DecentTooltip label={tooltip}>
          {txHash ? (
            <DisplayTransaction
              isTextLink
              txHash={txHash}
            />
          ) : (
            <Text color="white-0">{value}</Text>
          )}
        </DecentTooltip>
      )}
    </Box>
  );
}
