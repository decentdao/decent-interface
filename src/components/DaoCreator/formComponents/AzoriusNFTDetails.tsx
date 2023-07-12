import { Flex, Input, Divider, Button } from '@chakra-ui/react';
import { AddPlus, Minus } from '@decent-org/fractal-ui';
import { Field, FieldAttributes, FormikErrors } from 'formik';
import { useTranslation } from 'react-i18next';
import {
  ICreationStepProps,
  CreatorSteps,
  ERC721TokenConfig,
  BigNumberValuePair,
} from '../../../types';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { BigNumberInput } from '../../ui/forms/BigNumberInput';
import { LabelComponent } from '../../ui/forms/InputComponent';
import { StepButtons } from '../StepButtons';
import { StepWrapper } from '../StepWrapper';

export default function AzoriusNFTDetails(props: ICreationStepProps) {
  const { transactionPending, isSubDAO, setFieldValue, values, isSubmitting, mode, errors } = props;
  const { t } = useTranslation('daoCreate');

  const handleAddNFT = () => {
    setFieldValue('erc721Token.nfts', [
      ...values.erc721Token.nfts,
      { tokenAddress: '', tokenWeight: { value: '' } },
    ]);
  };

  const handleRemoveNFT = (indexToRemove: number) => {
    setFieldValue(
      'erc721Token.nfts',
      values.erc721Token.nfts.filter((_, i) => i !== indexToRemove)
    );
  };

  return (
    <StepWrapper
      mode={mode}
      isSubDAO={isSubDAO}
      isFormSubmitting={!!isSubmitting || transactionPending}
      titleKey="titleNFTConfig"
    >
      <Flex
        flexDirection="column"
        gap={8}
        alignItems="flex-start"
      >
        <ContentBoxTitle>{t('titleNFTsParams')}</ContentBoxTitle>
        {values.erc721Token.nfts.map((nft, i) => {
          const nftError = (
            errors?.erc721Token?.nfts as FormikErrors<
              ERC721TokenConfig<BigNumberValuePair>[] | undefined
            >
          )?.[i];
          const addressErrorMessage =
            nftError?.tokenAddress && nft.tokenAddress.length ? nftError.tokenAddress : undefined;
          const weightErrorMessage =
            nftError?.tokenWeight && nftError.tokenWeight.value && nft.tokenWeight.value.length
              ? nftError.tokenWeight.value
              : undefined;

          const isFirstElement = i === 0;
          return (
            <Flex
              key={i}
              gap={4}
              alignItems="flex-start"
              width="100%"
            >
              <LabelComponent
                label={isFirstElement ? t('labelNFTAddress') : undefined}
                helper={isFirstElement ? t('helperNFTAddress') : undefined}
                isRequired={isFirstElement}
                helperSlot="end"
                errorMessage={addressErrorMessage}
                gridContainerProps={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  width: '66.7%',
                }}
                inputContainerProps={{
                  width: '100%',
                }}
              >
                <Field name={`erc721Token.nfts.${i}.tokenAddress`}>
                  {({ field }: FieldAttributes<any>) => (
                    <Input
                      {...field}
                      value={nft.tokenAddress}
                      onChange={e =>
                        setFieldValue(`erc721Token.nfts.${i}.tokenAddress`, e.target.value)
                      }
                      data-testid={`erc721Token.nfts.${i}.tokenAddressInput`}
                      minWidth="100%"
                    />
                  )}
                </Field>
              </LabelComponent>
              <LabelComponent
                label={isFirstElement ? t('labelNFTWeight') : undefined}
                helper={isFirstElement ? t('helperNFTWeight') : undefined}
                isRequired={isFirstElement}
                errorMessage={weightErrorMessage}
                helperSlot="end"
                gridContainerProps={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  width: values.erc721Token.nfts.length > 1 ? '20%' : '33.3%',
                }}
                inputContainerProps={{
                  width: '100%',
                }}
              >
                <BigNumberInput
                  value={nft.tokenWeight.bigNumberValue}
                  onChange={valuePair =>
                    setFieldValue(`erc721Token.nfts.${i}.tokenWeight`, valuePair)
                  }
                  data-testid={`erc721Token.nfts.${i}.tokenWeightInput`}
                  decimalPlaces={0}
                  min="1"
                />
              </LabelComponent>
              {values.erc721Token.nfts.length > 1 && (
                <Button
                  variant="text"
                  onClick={() => handleRemoveNFT(i)}
                  alignSelf="center"
                  marginBottom={isFirstElement ? 4 : 0}
                >
                  <Minus
                    width="16px"
                    height="16px"
                  />
                </Button>
              )}
            </Flex>
          );
        })}
        <Button
          variant="text"
          onClick={handleAddNFT}
          paddingLeft={0}
        >
          <AddPlus
            width="24px"
            height="24px"
          />
          {t('addNFTButton')}
        </Button>
        <Divider
          color="chocolate.700"
          mt="2rem"
          mb="2rem"
        />
        <StepButtons
          {...props}
          prevStep={CreatorSteps.ESSENTIALS}
          nextStep={CreatorSteps.AZORIUS_DETAILS}
        />
      </Flex>
    </StepWrapper>
  );
}
