import { Flex, Input, Divider, Button } from '@chakra-ui/react';
import { AddPlus } from '@decent-org/fractal-ui';
import { Field, FieldAttributes } from 'formik';
import { useTranslation } from 'react-i18next';
import { ICreationStepProps, CreatorSteps } from '../../../types';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { LabelComponent } from '../../ui/forms/InputComponent';
import { StepButtons } from '../StepButtons';
import { StepWrapper } from '../StepWrapper';

export default function AzoriusNFTDetails(props: ICreationStepProps) {
  const { transactionPending, isSubDAO, setFieldValue, values, handleChange, isSubmitting, mode } =
    props;
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
      values.erc721Token.nfts.filter((nft, i) => i !== indexToRemove)
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
      >
        <ContentBoxTitle>{t('titleNFTsParams')}</ContentBoxTitle>
        {values.erc721Token.nfts.map((nft, i) => (
          <Flex
            key={nft.tokenAddress}
            gap={4}
          >
            <LabelComponent
              label={i === 0 ? t('labelNFTAddress') : undefined}
              helper={i === 0 ? t('helperNFTAddress') : undefined}
              isRequired
              helperSlot="end"
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
              label={i === 0 ? t('labelNFTWeight') : undefined}
              helper={i === 0 ? t('helperNFTWeight') : undefined}
              isRequired
              helperSlot="end"
              gridContainerProps={{
                display: 'flex',
                flexWrap: 'wrap',
                width: '33.3%',
              }}
              inputContainerProps={{
                width: '100%',
              }}
            >
              <Input
                name={`erc721Token.nfts.${i}.tokenWeight`}
                value={nft.tokenWeight.value}
                onChange={handleChange}
                data-testid={`erc721Token.nfts.${i}.tokenWeightInput`}
              />
            </LabelComponent>
          </Flex>
        ))}
        <Button
          variant="text"
          onClick={handleAddNFT}
        >
          <AddPlus />
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
