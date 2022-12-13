import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Text,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { TxProposal } from '../../../providers/Fractal/types';
import { DecodedTransaction } from '../../../types';

function TransactionRow({ paramKey, value }: { paramKey: string; value: string }) {
  return (
    <Flex
      width="full"
      textStyle="text-base-mono-regular"
      color="grayscale.100"
      justifyContent="space-between"
    >
      <Text whiteSpace="nowrap">{paramKey}</Text>
      <Text
        textAlign="end"
        maxWidth="70%"
      >
        {value}
      </Text>
    </Flex>
  );
}
function TransactionBlock({ transaction }: { transaction: DecodedTransaction }) {
  return (
    <Flex
      width="full"
      borderRadius="4px"
      bg="black.600"
      flexWrap="wrap"
      padding={4}
      rowGap={2}
    >
      <TransactionRow
        paramKey="target"
        value={transaction.target}
      />
      <TransactionRow
        paramKey="function"
        value={transaction.function}
      />
      <TransactionRow
        paramKey="parameter types"
        value={transaction.parameterTypes.join(', ')}
      />
      <TransactionRow
        paramKey="parameter values"
        value={transaction.parameterValues.join(', ')}
      />
    </Flex>
  );
}

export default function ProposalExecutableCode({ proposal }: { proposal: TxProposal }) {
  const { t } = useTranslation('proposal');
  if (!proposal.metaData) {
    return null;
  }
  return (
    <Box
      bg="black.900"
      borderRadius="4px"
      marginTop={4}
      paddingTop={2}
      paddingBottom={2}
    >
      <Accordion allowToggle>
        <AccordionItem
          borderTop="none"
          borderBottom="none"
        >
          {({ isExpanded }) => (
            <>
              <AccordionButton
                textStyle="text-button-md-semibold"
                color="grayscale.100"
              >
                <AccordionIcon
                  marginRight={3}
                  transform={`rotate(-${isExpanded ? '0' : '90'}deg)`}
                />
                {t('showExecutableCode')}
              </AccordionButton>
              <AccordionPanel paddingBottom={4}>
                <Flex
                  gap={2}
                  flexWrap="wrap"
                >
                  {proposal.metaData?.decodedTransactions.map((tx, i) => (
                    <TransactionBlock
                      transaction={tx}
                      key={i}
                    />
                  ))}
                </Flex>
              </AccordionPanel>
            </>
          )}
        </AccordionItem>
      </Accordion>
    </Box>
  );
}
