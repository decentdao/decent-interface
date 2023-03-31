import { Avatar, Box, Divider, HStack, Text, VStack } from '@chakra-ui/react';
import { FormikProps } from 'formik';
import { Fragment, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../constants/common';
import { CreateIntegrationForm } from '../../types/createIntegration';

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

export default function IntegrationDetails({
  values: { integrationMetadata, transactions },
}: FormikProps<CreateIntegrationForm>) {
  const { t } = useTranslation(['integration', 'proposal']);

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
          <Text>{integrationMetadata.title}</Text>
        </HStack>
        <HStack justifyContent="space-between">
          <Text color="grayscale.500">{t('previewThumnbail')}</Text>
          {integrationMetadata.title && (
            <Avatar
              size="sm"
              w="28px"
              h="28px"
              name={integrationMetadata.title}
              borderRadius="4px"
              getInitials={(title: string) => title.slice(0, 2)}
            />
          )}
        </HStack>
        <HStack justifyContent="space-between">
          <Text color="grayscale.500">{t('integrationDescription')}</Text>
          <Text textAlign="right">{integrationMetadata.description}</Text>
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
