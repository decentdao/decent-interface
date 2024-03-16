import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Switch,
  VStack,
} from '@chakra-ui/react';
import { utils } from 'ethers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DAO_ROUTES } from '../../../constants/routes';
import { logError } from '../../../helpers/errorLogging';
import { usePrepareProposal } from '../../../hooks/DAO/proposal/usePrepareProposal';
import useSubmitProposal from '../../../hooks/DAO/proposal/useSubmitProposal';
import { useFractal } from '../../../providers/App/AppProvider';
import { ProposalTemplate } from '../../../types/createProposalTemplate';
import { isValidUrl } from '../../../utils/url';
import { CustomNonceInput } from '../forms/CustomNonceInput';
import { InputComponent } from '../forms/InputComponent';
import Markdown from '../proposal/Markdown';

interface IProposalTemplateModalProps {
  proposalTemplate: ProposalTemplate;
  onClose: () => void;
}

export default function ProposalTemplateModal({
  proposalTemplate: { title, description, transactions },
  onClose,
}: IProposalTemplateModalProps) {
  const {
    node: { daoAddress, safe },
  } = useFractal();

  const [filledProposalTransactions, setFilledProposalTransactions] = useState(transactions);
  const [nonce, setNonce] = useState<number | undefined>(safe!.nonce);
  const [showAll, setShowAll] = useState(false);
  const { t } = useTranslation(['proposalTemplate', 'proposal']);
  const navigate = useNavigate();
  const { submitProposal, canUserCreateProposal } = useSubmitProposal();
  const { prepareProposal } = usePrepareProposal();

  const handleParameterChange = ({
    transactionIndex,
    parameterIndex,
    value,
  }: {
    transactionIndex: number;
    parameterIndex: number;
    value: string;
  }) => {
    // We probably could use Formik and Yup here
    // However constructing and validating form will be quite complicated and involving parsing user input
    // Thus, for now - we simply store form state through useState
    setFilledProposalTransactions(prevState =>
      prevState.map((transaction, txIndex) => {
        if (transactionIndex === txIndex) {
          return {
            ...transaction,
            parameters: transaction.parameters.map((parameter, paramIndex) => {
              if (paramIndex === parameterIndex) {
                return {
                  ...parameter,
                  value,
                };
              }
              return parameter;
            }),
          };
        }
        return transaction;
      }),
    );
  };

  const successCallback = () => {
    if (daoAddress) {
      navigate(DAO_ROUTES.proposals.relative(daoAddress));
      onClose();
    }
  };

  const handleSubmitProposal = async () => {
    const proposalMetadata = {
      title: `Proposal from ${title} template`,
      description,
      documentationUrl: '',
    };

    const proposalTransactions = filledProposalTransactions.map(
      ({ targetAddress, ethValue, functionName, parameters }) => {
        return {
          targetAddress: utils.getAddress(targetAddress), // Safe proposal creation/execution might fail if targetAddress is not checksummed
          ethValue,
          functionName,
          functionSignature: parameters.map(parameter => parameter.signature.trim()).join(', '),
          parameters: parameters
            .map(parameter =>
              isValidUrl(parameter.value!.trim())
                ? encodeURIComponent(parameter.value!.trim()) // If parameter.value is valid URL with special symbols like ":" or "?" - decoding might fail, thus we need to encode URL
                : parameter.value!.trim(),
            )
            .join(', '),
        };
      },
    );
    try {
      const proposalData = await prepareProposal({
        proposalMetadata,
        transactions: proposalTransactions,
      });

      submitProposal({
        proposalData,
        successCallback,
        nonce,
        pendingToastMessage: t('proposalCreatePendingToastMessage', { ns: 'proposal' }),
        successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
        failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
      });
    } catch (e) {
      logError('Error during submitting proposal from template', e);
    }
  };

  // The form is valid when there's no parameter without filled value
  const isValid = !filledProposalTransactions.find(
    transaction => !!transaction.parameters.find(parameter => !parameter.value),
  );

  return (
    <Box>
      {description && <Markdown content={description}/>}
      <Divider color="chocolate.700" />
      {filledProposalTransactions.map((transaction, transactionIndex) => (
        <VStack key={transactionIndex}>
          {transaction.parameters.map(
            (parameter, parameterIndex) =>
              (showAll || parameter.label) && (
                <Flex
                  key={parameterIndex}
                  width="100%"
                  flexWrap="wrap"
                  marginTop="1.5rem"
                >
                  <InputComponent
                    label={parameter.label || parameter.signature}
                    placeholder={parameter.signature}
                    value={parameter.value || ''}
                    isRequired={!!parameter.label}
                    disabled={!parameter.label}
                    testId={`proposalTemplate.transactions.${transactionIndex}.parameters.${parameterIndex}`}
                    inputContainerProps={{
                      width: '100%',
                    }}
                    gridContainerProps={{
                      width: '100%',
                      display: 'flex',
                      flexWrap: 'wrap',
                    }}
                    onChange={event =>
                      handleParameterChange({
                        transactionIndex,
                        parameterIndex,
                        value: event.target.value,
                      })
                    }
                  />
                </Flex>
              ),
          )}
          {transaction.parameters.length > 0 && <Divider color="chocolate.700" />}
        </VStack>
      ))}
      <FormControl
        my="1rem"
        display="flex"
        alignItems="center"
      >
        <FormLabel mb={0}>{t('showParameters')}</FormLabel>
        <Switch
          isChecked={showAll}
          onChange={() => setShowAll(!showAll)}
          colorScheme="gold"
          bg="grayscale.300"
          borderRadius="9999px"
        />
      </FormControl>
      <Divider color="chocolate.700" />
      <Box marginTop="1.5rem">
        <CustomNonceInput
          nonce={nonce}
          onChange={newNonce => setNonce(newNonce ? newNonce : undefined)}
        />
      </Box>
      <Button
        marginTop="1.5rem"
        width="100%"
        isDisabled={!isValid || !canUserCreateProposal}
        onClick={handleSubmitProposal}
      >
        {t('submitProposalFromTemplate')}
      </Button>
    </Box>
  );
}
