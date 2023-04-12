import { Avatar, Box, Divider, HStack, Text, VStack } from '@chakra-ui/react';
import { FormikProps } from 'formik';
import { Fragment, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../constants/common';
import { CreateProposalTemplateForm } from '../../types/createProposalTemplate';

export function TransactionValueContainer({
  children,
  isValue = true,
}: PropsWithChildren<{ isValue?: boolean }>) {
  return (
    <Box
      bg={isValue ? 'black.900' : 'chocolate.800'}
      borderRadius="8px"
      px={4}
      py={2}
    >
      <Text
        color="grayscale.100"
        fontStyle={isValue ? 'normal' : 'italic'}
      >
        {children}
      </Text>
    </Box>
  );
}

export default function ProposalTemplateDetails({
  values: { proposalTemplateMetadata, transactions },
}: FormikProps<CreateProposalTemplateForm>) {
  const { t } = useTranslation(['proposalTemplate', 'proposal']);
  const trimmedTitle = proposalTemplateMetadata.title.trim();

  return (
    <Box
      rounded="lg"
      p={4}
      bg={BACKGROUND_SEMI_TRANSPARENT}
      width="416px"
    >
      <VStack
        spacing={3}
        align="left"
      >
        <Text textStyle="text-lg-mono-medium">{t('preview')}</Text>
        <Divider color="chocolate.700" />
        <HStack justifyContent="space-between">
          <Text color="grayscale.500">{t('previewTitle')}</Text>
          <Text textAlign="right">{trimmedTitle}</Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text color="grayscale.500">{t('previewThumnbail')}</Text>
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
        <HStack justifyContent="space-between">
          <Text color="grayscale.500">{t('proposalTemplateDescription')}</Text>
          <Text
            textAlign="right"
            wordBreak="break-all"
          >
            {proposalTemplateMetadata.description.trim()}
          </Text>
        </HStack>
        <Divider color="chocolate.700" />
        {transactions.map((transaction, i) => (
          <Fragment key={i}>
            <Text color="grayscale.500">{t('labelTargetAddress', { ns: 'proposal' })}</Text>
            {transaction.targetAddress && (
              <TransactionValueContainer>{transaction.targetAddress}</TransactionValueContainer>
            )}
            <Divider color="chocolate.700" />
            <Text color="grayscale.500">{t('labelFunctionName', { ns: 'proposal' })}</Text>
            {transaction.functionName && (
              <TransactionValueContainer>{transaction.functionName}</TransactionValueContainer>
            )}
            {transaction.parameters.map((parameter, parameterIndex) => (
              <Fragment key={parameterIndex}>
                <Text color="grayscale.500">{t('parameter')}</Text>
                {parameter.signature && (
                  <TransactionValueContainer>{parameter.signature}</TransactionValueContainer>
                )}
                <Text color="grayscale.500">
                  {!!parameter.label ? parameter.label : t('value')}
                </Text>
                {(parameter.label || parameter.value) && (
                  <TransactionValueContainer isValue={!!parameter.value}>
                    {parameter.value || t('userInput')}
                  </TransactionValueContainer>
                )}
              </Fragment>
            ))}
            <Divider color="chocolate.700" />
            <HStack justifyContent="space-between">
              <Text color="grayscale.500">{t('eth')}</Text>
              <Text
                textAlign="right"
                color={transaction.ethValue.bigNumberValue?.gt(0) ? 'white' : 'grayscale.500'}
                wordBreak="break-all"
              >
                {transaction.ethValue.bigNumberValue?.gt(0) ? transaction.ethValue.value : 'n/a'}
              </Text>
            </HStack>
          </Fragment>
        ))}
      </VStack>
    </Box>
  );
}
