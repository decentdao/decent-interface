import { Box, Flex, Grid, GridItem, Input, Divider, Button } from '@chakra-ui/react';
import { AddPlus, Minus } from '@decent-org/fractal-ui';
import { Field, FieldAttributes, FormikErrors } from 'formik';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import {
  ICreationStepProps,
  CreatorSteps,
  ERC721TokenConfig,
  BigIntValuePair,
} from '../../../types';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { BigIntInput } from '../../ui/forms/BigIntInput';
import { LabelComponent } from '../../ui/forms/InputComponent';
import { StepButtons } from '../StepButtons';
import { StepWrapper } from '../StepWrapper';
import AzoriusNFTDetail from './AzoriusNFTDetail';

const templateAreaTwoCol = '"content details"';
const templateAreaSingleCol = `"content"
  "details"`;

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
      values.erc721Token.nfts.filter((_, i) => i !== indexToRemove),
    );
  };

  return (
    <StepWrapper
      mode={mode}
      isSubDAO={isSubDAO}
      isFormSubmitting={!!isSubmitting || transactionPending}
      titleKey="titleNFTConfig"
      shouldWrapChildren={false}
    >
      <Grid
        gap={4}
        templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
        gridTemplateRows={{ base: '1fr', lg: '5.1em 1fr' }}
        templateAreas={{
          base: templateAreaSingleCol,
          lg: templateAreaTwoCol,
        }}
      >
        <GridItem area="content">
          <Flex
            flexDirection="column"
            gap={5}
            alignItems="flex-start"
            bg={BACKGROUND_SEMI_TRANSPARENT}
            rounded="lg"
            px={4}
            py={8}
          >
            <ContentBoxTitle>{t('titleNFTsParams')}</ContentBoxTitle>
            {values.erc721Token.nfts.map((nft, i) => {
              const nftError = (
                errors?.erc721Token?.nfts as FormikErrors<
                  ERC721TokenConfig<BigIntValuePair>[] | undefined
                >
              )?.[i];
              const addressErrorMessage =
                nftError?.tokenAddress && nft.tokenAddress.length
                  ? nftError.tokenAddress
                  : undefined;
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
                      width: '65%',
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
                      width: '35%',
                    }}
                    inputContainerProps={{
                      width: '100%',
                    }}
                  >
                    <Flex>
                      <BigIntInput
                        value={nft.tokenWeight.bigintValue}
                        onChange={valuePair =>
                          setFieldValue(`erc721Token.nfts.${i}.tokenWeight`, valuePair)
                        }
                        data-testid={`erc721Token.nfts.${i}.tokenWeightInput`}
                        decimalPlaces={0}
                        isRequired
                        min="1"
                      />
                      {values.erc721Token.nfts.length > 1 && (
                        <Minus
                          cursor="pointer"
                          color="gold.500"
                          boxSize="1.5rem"
                          ms="1.5rem"
                          me="0.5rem"
                          onClick={() => handleRemoveNFT(i)}
                          alignSelf={'center'}
                        />
                      )}
                    </Flex>
                  </LabelComponent>
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
            <Divider color="chocolate.700" />
            <StepButtons
              {...props}
              prevStep={CreatorSteps.ESSENTIALS}
              nextStep={CreatorSteps.AZORIUS_DETAILS}
            />
          </Flex>
        </GridItem>
        <GridItem
          area="details"
          width="100%"
        >
          <Box
            bg={BACKGROUND_SEMI_TRANSPARENT}
            rounded="lg"
            p={4}
          >
            <ContentBoxTitle>{t('titleNFTDetails')}</ContentBoxTitle>
            <Divider
              color="chocolate.700"
              mt="1rem"
              mb="1rem"
            />
            {values.erc721Token.nfts.map((nft, i) => {
              const nftError = (
                errors?.erc721Token?.nfts as FormikErrors<
                  ERC721TokenConfig<BigIntValuePair>[] | undefined
                >
              )?.[i];
              const addressErrorMessage =
                nftError?.tokenAddress && nft.tokenAddress.length
                  ? nftError.tokenAddress
                  : undefined;
              return (
                <Fragment key={i}>
                  <AzoriusNFTDetail
                    nft={nft}
                    hasAddressError={!!addressErrorMessage}
                  />
                  {i < values.erc721Token.nfts.length - 1 && (
                    <Divider
                      color="chocolate.700"
                      mt="2rem"
                      mb="2rem"
                    />
                  )}
                </Fragment>
              );
            })}
          </Box>
        </GridItem>
      </Grid>
    </StepWrapper>
  );
}
