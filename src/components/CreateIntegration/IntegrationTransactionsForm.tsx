import { Button, Box, Flex, Text, VStack, Divider, Alert, AlertTitle } from '@chakra-ui/react';
import { Info } from '@decent-org/fractal-ui';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { CreateIntegrationForm, CreateIntegrationState } from '../../types/createIntegration';
import IntegrationTransactions from './IntegrationTransactions';
import { DEFAULT_INTEGRATION_TRANSACTION } from './constants';

interface IntegrationTransactionsFormProps extends FormikProps<CreateIntegrationForm> {
  pendingTransaction: boolean;
  setFormState: (state: CreateIntegrationState) => void;
  canUserCreateProposal: boolean;
}

export default function IntegrationTransactionsForm(props: IntegrationTransactionsFormProps) {
  const {
    pendingTransaction,
    setFormState,
    setFieldValue,
    values: { transactions },
    errors: { transactions: transactionsError },
    canUserCreateProposal,
  } = props;
  const { t } = useTranslation(['integration', 'proposal', 'common']);

  return (
    <Box>
      <IntegrationTransactions {...props} />
      <VStack
        align="left"
        spacing={6}
        pt={2}
      >
        <Button
          variant="text"
          onClick={() =>
            setFieldValue('transactions', [...transactions, DEFAULT_INTEGRATION_TRANSACTION])
          }
          disabled={pendingTransaction}
          w="fit-content"
          pl={0}
        >
          {t('labelAddTransaction', { ns: 'proposal' })}
        </Button>
        <Alert
          status="info"
          w="fit-full"
        >
          <Info boxSize="1.5rem" />
          <AlertTitle>
            <Text
              textStyle="text-lg-mono-medium"
              whiteSpace="pre-wrap"
            >
              {t('transactionExecutionAlertMessage', { ns: 'proposal' })}
            </Text>
          </AlertTitle>
        </Alert>
        <Divider color="chocolate.700" />
        <Flex>
          <Button
            variant="text"
            textStyle="text-md-mono-regular"
            color="gold.500"
            cursor="pointer"
            onClick={() => setFormState(CreateIntegrationState.METADATA_FORM)}
            mb={4}
          >
            {`< ${t('proposalBack', { ns: 'proposal' })}`}
          </Button>

          <Button
            w="100%"
            type="submit"
            disabled={!canUserCreateProposal || !!transactionsError || pendingTransaction}
          >
            {t('createProposal', { ns: 'proposal' })}
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
