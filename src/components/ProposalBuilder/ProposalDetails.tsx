import { Avatar, Box, HStack, Text, VStack } from '@chakra-ui/react';
import { FormikProps } from 'formik';
import { Fragment, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateProposalForm, ProposalBuilderMode } from '../../types/proposalBuilder';
import Markdown from '../ui/proposal/Markdown';
import Divider from '../ui/utils/Divider';
import '../../assets/css/Markdown.css';

export function TransactionValueContainer({ children }: PropsWithChildren<{}>) {
  return (
    <Box
      bg="neutral-2"
      borderRadius={4}
      padding={2}
    >
      <Text
        color="neutral-grayscale-100"
        fontStyle="code-snippet-helper"
      >
        {children}
      </Text>
    </Box>
  );
}

export default function ProposalTemplateDetails({
  values: { proposalMetadata, transactions },
  mode,
}: FormikProps<CreateProposalForm> & { mode: ProposalBuilderMode }) {
  const { t } = useTranslation(['proposalTemplate', 'proposal']);
  const trimmedTitle = proposalMetadata.title?.trim();

  return (
    <Box
      rounded="lg"
      border="1px solid"
      borderColor="neutral-3"
      p={6}
      maxWidth="400px"
    >
      <VStack
        spacing={3}
        align="left"
      >
        <Text textStyle="display-lg">{t('preview')}</Text>
        <Divider />
        <HStack justifyContent="space-between">
          <Text color="neutral-7">{t('previewTitle')}</Text>
          <Text
            textAlign="right"
            width="66%"
          >
            {trimmedTitle}
          </Text>
        </HStack>
        {mode === ProposalBuilderMode.TEMPLATE && (
          <HStack justifyContent="space-between">
            <Text color="neutral-7">{t('previewThumnbail')}</Text>
            {trimmedTitle && (
              <Avatar
                size="sm"
                w="28px"
                h="28px"
                name={trimmedTitle}
                borderRadius="4px"
                getInitials={(title: string) => title.slice(0, 2)}
              />
            )}
          </HStack>
        )}
        <HStack justifyContent="space-between">
          <Text color="neutral-7">{t('proposalTemplateDescription')}</Text>
          <Markdown
            content={proposalMetadata.description}
            collapsedLines={1}
            hideCollapsed
          />
        </HStack>
        <Divider />
        {transactions.map((transaction, i) => {
          const valueBiggerThanZero = transaction.ethValue.bigintValue
            ? transaction.ethValue.bigintValue > 0n
            : false;
          return (
            <Fragment key={i}>
              <Text color="neutral-7">{t('labelTargetAddress', { ns: 'proposal' })}</Text>
              {transaction.targetAddress && (
                <TransactionValueContainer>{transaction.targetAddress}</TransactionValueContainer>
              )}
              <Divider />
              <Text color="neutral-7">{t('labelFunctionName', { ns: 'proposal' })}</Text>
              {transaction.functionName && (
                <TransactionValueContainer>{transaction.functionName}</TransactionValueContainer>
              )}
              {transaction.parameters.map((parameter, parameterIndex) => (
                <Fragment key={parameterIndex}>
                  <Text color="neutral-7">{t('parameter')}</Text>
                  {parameter.signature && (
                    <TransactionValueContainer>{parameter.signature}</TransactionValueContainer>
                  )}
                  <Text color="neutral-7">{!!parameter.label ? parameter.label : t('value')}</Text>
                  {(parameter.label || parameter.value) && (
                    <TransactionValueContainer>
                      {parameter.value || t('userInput')}
                    </TransactionValueContainer>
                  )}
                </Fragment>
              ))}
              <Divider />
              <HStack justifyContent="space-between">
                <Text color="neutral-7">{t('eth')}</Text>
                <Text
                  textAlign="right"
                  color={valueBiggerThanZero ? 'white-0' : 'neutral-7'}
                  wordBreak="break-all"
                >
                  {valueBiggerThanZero ? transaction.ethValue.value : 'n/a'}
                </Text>
              </HStack>
            </Fragment>
          );
        })}
      </VStack>
    </Box>
  );
}
