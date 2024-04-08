import { Box, Flex, Input, RadioGroup, Text } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { BigNumber, constants, ethers, utils } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { erc20Abi } from 'viem';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { createAccountSubstring } from '../../../hooks/utils/useDisplayName';
import { useEthersProvider } from '../../../providers/Ethers/hooks/useEthersProvider';
import { TokenCreationType, ICreationStepProps } from '../../../types';
import SupportTooltip from '../../ui/badges/SupportTooltip';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { LabelComponent } from '../../ui/forms/InputComponent';
import { RadioWithText } from '../../ui/forms/Radio/RadioWithText';
import { StepWrapper } from '../StepWrapper';
import { usePrepareFormData } from '../hooks/usePrepareFormData';
import { VotesTokenImport } from './VotesTokenImport';
import { VotesTokenNew } from './VotesTokenNew';

function TokenConfigDisplay(props: ICreationStepProps) {
  switch (props.values.erc20Token.tokenCreationType) {
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
    isSubmitting,
    mode,
  } = props;

  const { t } = useTranslation('daoCreate');
  const provider = useEthersProvider();

  const { checkVotesToken } = usePrepareFormData();
  const [isImportedVotesToken, setIsImportedVotesToken] = useState(false);

  const updateImportFields = useCallback(async () => {
    const importAddress = values.erc20Token.tokenImportAddress;
    const importError = errors?.erc20Token?.tokenImportAddress;
    if (importAddress && !importError && utils.isAddress(importAddress)) {
      const isVotesToken = await checkVotesToken(importAddress);
      const tokenContract = new ethers.Contract(importAddress, erc20Abi, provider);
      const name: string = await tokenContract.name();
      const symbol: string = await tokenContract.symbol();
      const decimals: number = await tokenContract.decimals();
      const totalSupply: number = (await tokenContract.totalSupply()) / 10 ** decimals;
      setFieldValue(
        'erc20Token.tokenSupply',
        {
          value: totalSupply,
          bigNumberValue: BigNumber.from(totalSupply),
        },
        true,
      );
      if (!isVotesToken) {
        setFieldValue('erc20Token.tokenName', 'Wrapped ' + name, true);
        setFieldValue('erc20Token.tokenSymbol', 'W' + symbol, true);
        setIsImportedVotesToken(false);
      } else {
        setIsImportedVotesToken(true);
        setFieldValue('erc20Token.tokenName', name, true);
        setFieldValue('erc20Token.tokenSymbol', symbol, true);
      }
    } else {
      setIsImportedVotesToken(false);
    }
  }, [
    checkVotesToken,
    errors?.erc20Token?.tokenImportAddress,
    setFieldValue,
    provider,
    values.erc20Token.tokenImportAddress,
  ]);

  useEffect(() => {
    updateImportFields();
  }, [updateImportFields]);

  return (
    <>
      <StepWrapper
        mode={mode}
        isSubDAO={isSubDAO}
        isFormSubmitting={!!isSubmitting || transactionPending}
        titleKey="titleAzoriusConfig"
      >
        <Flex
          flexDirection="column"
          gap={4}
        >
          <ContentBoxTitle>{t('titleSelectToken')}</ContentBoxTitle>
          <LabelComponent
            helper={t('helperSelectToken')}
            isRequired={false}
          >
            <RadioGroup
              bg={BACKGROUND_SEMI_TRANSPARENT}
              px={8}
              py={4}
              rounded="lg"
              display="flex"
              flexDirection="column"
              name="erc20Token.tokenCreationType"
              gap={4}
              id="erc20Token.tokenCreationType"
              value={values.erc20Token.tokenCreationType}
              onChange={value => {
                setFieldValue('erc20Token.tokenCreationType', value);
              }}
            >
              <RadioWithText
                label={t('radioLabelNewToken')}
                description={t('helperNewToken')}
                testId="choose-newToken"
                value={TokenCreationType.NEW}
                onClick={() => {
                  setFieldValue('erc20Token.tokenImportAddress', '');
                  setFieldValue('erc20Token.tokenName', '');
                  setFieldValue('erc20Token.tokenSymbol', '');
                  setFieldValue('erc20Token.tokenSupply', '');
                }}
              />
              <RadioWithText
                label={t('radioLabelExistingToken')}
                description={t('helperExistingToken')}
                testId="choose-existingToken"
                value={TokenCreationType.IMPORTED}
                onClick={() => {
                  setFieldValue('erc20Token.tokenName', '');
                  setFieldValue('erc20Token.tokenSymbol', '');
                  setFieldValue('erc20Token.tokenSupply', '');
                }}
              />
              {values.erc20Token.tokenCreationType === TokenCreationType.IMPORTED && (
                <>
                  <LabelWrapper
                    errorMessage={
                      values.erc20Token.tokenImportAddress && errors?.erc20Token?.tokenImportAddress
                        ? errors.erc20Token.tokenImportAddress
                        : undefined
                    }
                  >
                    <Input
                      name="erc20Token.tokenImportAddress"
                      onChange={handleChange}
                      value={values.erc20Token.tokenImportAddress}
                      placeholder={createAccountSubstring(constants.AddressZero)}
                    />
                  </LabelWrapper>
                  {!isImportedVotesToken && !errors.erc20Token?.tokenImportAddress && (
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
                      <SupportTooltip
                        label={t('warningExistingTokenTooltip')}
                        color="blue.400"
                      />
                    </Flex>
                  )}
                </>
              )}
            </RadioGroup>
          </LabelComponent>
        </Flex>
      </StepWrapper>
      <Box
        bg={BACKGROUND_SEMI_TRANSPARENT}
        rounded="lg"
        mt={8}
        px={4}
        py={8}
      >
        <TokenConfigDisplay {...props} />
      </Box>
    </>
  );
}
