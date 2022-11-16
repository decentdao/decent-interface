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
import { Proposal } from '../../../providers/fractal/types';
import { DecodedTransaction } from '../../../types';

function TransactionRow({ paramKey, value }: { paramKey: string; value: string }) {
  return (
    <Flex
      width="full"
      justifyContent="space-between"
    >
      <Text>{paramKey}</Text>
      <Text>{value}</Text>
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

export default function ProposalExecutableCode({ proposal }: { proposal: Proposal }) {
  const { t } = useTranslation('proposal');

  return (
    <Box
      bg="black.900"
      borderRadius="4px"
      marginTop={8}
      paddingTop={2}
    >
      <Accordion allowToggle>
        <AccordionItem
          borderTop="none"
          borderBottom="none"
        >
          <Text
            color="grayscale.100"
            textStyle="text-button-md-semibold"
          >
            <AccordionButton>
              <AccordionIcon />
              {t('showExecutableCode')}
            </AccordionButton>
          </Text>
          <AccordionPanel paddingBottom={4}>
            <Flex
              gap={2}
              flexWrap="wrap"
            >
              {proposal.decodedTransactions.map((tx, i) => (
                <TransactionBlock
                  transaction={tx}
                  key={i}
                />
              ))}
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
}
