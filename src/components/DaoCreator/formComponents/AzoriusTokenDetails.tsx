import { Box, Flex, Input, RadioGroup, Text, Tooltip } from '@chakra-ui/react';
import { LabelWrapper, SupportQuestion } from '@decent-org/fractal-ui';
import { constants, ethers, utils } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { erc20ABI, useProvider } from 'wagmi';
import { createAccountSubstring } from '../../../hooks/utils/useDisplayName';
import { TokenCreationType, ICreationStepProps } from '../../../types';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { LabelComponent } from '../../ui/forms/InputComponent';
import { RadioWithText } from '../../ui/forms/Radio/RadioWithText';
import { StepWrapper } from '../StepWrapper';
import { usePrepareFormData } from '../hooks/usePrepareFormData';
import { VotesTokenImport } from './VotesTokenImport';
import { VotesTokenNew } from './VotesTokenNew';

function TokenConfigDisplay(props: ICreationStepProps) {
  switch (props.values.govToken.tokenCreationType) {
    case TokenCreationType.NEW:
      return <VotesTokenNew {...props} />;
    case TokenCreationType.IMPORTED:
      return <VotesTokenImport {...props} />;
    default:
      return null;
  }
}

export function AzoriusTokenDetails(props: ICreationStepProps) {
  const {
    transactionPending,
    isSubDAO,
    setFieldValue,
    values,
    errors,
    handleChange,
    setFieldTouched,
    isSubmitting,
  } = props;

  const { t } = useTranslation('daoCreate');
  const provider = useProvider();

  const { checkVotesToken } = usePrepareFormData();
  const [isImportedVotesToken, setIsImportedVotesToken] = useState(false);

  const updateImportFields = useCallback(async () => {
    const importAddress = values.govToken.tokenImportAddress;
    const importError = errors?.govToken?.tokenImportAddress;
    if (importAddress && !importError && utils.isAddress(importAddress)) {
      const isVotesToken = await checkVotesToken(importAddress);
      const tokenContract = new ethers.Contract(importAddress, erc20ABI, provider);
      const name = await tokenContract.name();
      const symbol = await tokenContract.symbol();
      if (!isVotesToken) {
        setFieldValue('govToken.tokenName', 'Wrapped ' + name, true);
        setFieldValue('govToken.tokenSymbol', 'W' + symbol, true);
        setIsImportedVotesToken(false);
      } else {
        setIsImportedVotesToken(true);
        setFieldValue('govToken.tokenName', name, true);
        setFieldValue('govToken.tokenSymbol', symbol, true);
      }
    } else {
      setIsImportedVotesToken(false);
      setFieldValue('govToken.tokenName', '', true);
      setFieldValue('govToken.tokenSymbol', '', true);
    }
    setTimeout(() => {
      setFieldTouched('govToken.tokenSymbol', true, true);
      setFieldTouched('govToken.tokenName', true, true);
    }, 0);
  }, [
    checkVotesToken,
    errors?.govToken?.tokenImportAddress,
    setFieldValue,
    setFieldTouched,
    provider,
    values.govToken.tokenImportAddress,
  ]);

  useEffect(() => {
    updateImportFields();
  }, [updateImportFields]);

  return (
    <>
      <StepWrapper
        isSubDAO={isSubDAO}
        isFormSubmitting={!!isSubmitting || transactionPending}
        titleKey="titleAzoriusConfig"
      >
        <Flex
          flexDirection="column"
          gap={8}
        >
          <ContentBoxTitle>{t('titleSelectToken')}</ContentBoxTitle>
          <LabelComponent
            helper={t('helperSelectToken')}
            isRequired={false}
          >
            <RadioGroup
              bg="black.900-semi-transparent"
              px={8}
              py={4}
              rounded="md"
              display="flex"
              flexDirection="column"
              name="govToken.tokenCreationType"
              gap={4}
              id="govToken.tokenCreationType"
              value={values.govToken.tokenCreationType}
              onChange={value => {
                setFieldValue('govToken.tokenCreationType', value);
              }}
            >
              <RadioWithText
                label={t('radioLabelNewToken')}
                description={t('helperNewToken')}
                testId="choose-newToken"
                value={TokenCreationType.NEW}
                onClick={() => {
                  setFieldValue('govToken.tokenImportAddress', '');
                  setFieldValue('govToken.tokenName', '');
                  setFieldValue('govToken.tokenSymbol', '');
                }}
              />
              <RadioWithText
                label={t('radioLabelExistingToken')}
                description={t('helperExistingToken')}
                testId="choose-existingToken"
                value={TokenCreationType.IMPORTED}
                onClick={() => {
                  setFieldValue('govToken.tokenName', '');
                  setFieldValue('govToken.tokenSymbol', '');
                }}
              />
              {values.govToken.tokenCreationType === TokenCreationType.IMPORTED && (
                <>
                  <LabelWrapper
                    errorMessage={
                      values.govToken.tokenImportAddress && errors?.govToken?.tokenImportAddress
                        ? errors.govToken.tokenImportAddress
                        : undefined
                    }
                  >
                    <Input
                      name="govToken.tokenImportAddress"
                      onChange={handleChange}
                      value={values.govToken.tokenImportAddress}
                      placeholder={createAccountSubstring(constants.AddressZero)}
                    />
                  </LabelWrapper>
                  {!isImportedVotesToken && !errors.govToken?.tokenImportAddress && (
                    <Flex
                      gap={4}
                      alignItems="center"
                    >
                      <Text
                        color="blue.400"
                        textStyle="text-base-sans-medium"
                        whiteSpace="pre-wrap"
                      >
                        {t('warningExistingToken')}
                      </Text>
                      <Tooltip
                        maxW="18rem"
                        label={t('warningExistingTokenTooltip')}
                      >
                        <SupportQuestion
                          boxSize="1.5rem"
                          color="blue.400"
                        />
                      </Tooltip>
                    </Flex>
                  )}
                </>
              )}
            </RadioGroup>
          </LabelComponent>
        </Flex>
      </StepWrapper>
      <Box
        bg="black.900-semi-transparent"
        rounded="md"
        mt={8}
        px={4}
        py={8}
      >
        <TokenConfigDisplay {...props} />
      </Box>
    </>
  );
}
