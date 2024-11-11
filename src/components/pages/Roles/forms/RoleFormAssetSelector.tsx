import {
  Button,
  Flex,
  FormControl,
  Icon,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Show,
  Text,
} from '@chakra-ui/react';
import { CaretDown, CheckCircle } from '@phosphor-icons/react';
import {
  Field,
  FieldMetaProps,
  FieldInputProps,
  FormikErrors,
  useFormikContext,
  FormikProps,
} from 'formik';
import { useTranslation } from 'react-i18next';
import { getAddress } from 'viem';
import { CARD_SHADOW } from '../../../../constants/common';
import { useFractal } from '../../../../providers/App/AppProvider';
import { BigIntValuePair } from '../../../../types';
import { formatCoin, formatUSD } from '../../../../utils';
import { MOCK_MORALIS_ETH_ADDRESS } from '../../../../utils/address';
import DraggableDrawer from '../../../ui/containers/DraggableDrawer';
import { BigIntInput } from '../../../ui/forms/BigIntInput';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import Divider from '../../../ui/utils/Divider';
import { EaseOutComponent } from '../../../ui/utils/EaseOutComponent';
import { RoleFormValues } from '../types';

function AssetsList({ formIndex }: { formIndex: number }) {
  const { t } = useTranslation('roles');
  const {
    treasury: { assetsFungible },
  } = useFractal();
  const fungibleAssetsWithBalance = assetsFungible.filter(
    asset =>
      parseFloat(asset.balance) > 0 &&
      asset.tokenAddress.toLowerCase() !== MOCK_MORALIS_ETH_ADDRESS.toLowerCase(), // Can't stream native token
  );
  const { values, setFieldValue } = useFormikContext<RoleFormValues>();
  const selectedAsset = values.roleEditing?.payments?.[formIndex]?.asset;

  if (fungibleAssetsWithBalance.length === 0) {
    return (
      <Flex
        p="1rem"
        alignItems="center"
        justifyContent="center"
      >
        <Text
          textStyle="display-lg"
          color="neutral-7"
        >
          {t('emptyRolesAssets')}
        </Text>
      </Flex>
    );
  }

  return (
    <>
      {fungibleAssetsWithBalance.map((asset, index) => {
        const isSelected = selectedAsset?.address === asset.tokenAddress;
        return (
          <MenuItem
            key={index}
            p="1rem"
            _hover={{ bg: 'white-alpha-04' }}
            display="flex"
            alignItems="center"
            gap={2}
            borderRadius="0.25rem"
            justifyContent="space-between"
            w="full"
            onClick={() => {
              setFieldValue(`roleEditing.payments.${formIndex}.asset`, {
                name: asset.name,
                address: getAddress(asset.tokenAddress),
                symbol: asset.symbol,
                logo: asset.logo ?? '',
                decimals: asset.decimals,
              });
            }}
          >
            <Flex
              alignItems="center"
              gap="1rem"
            >
              <Image
                src={asset.logo ?? asset.thumbnail}
                fallbackSrc="/images/coin-icon-default.svg"
                boxSize="2rem"
              />
              <Flex flexDir="column">
                <Text
                  textStyle="label-base"
                  color="white-0"
                >
                  {asset?.symbol}
                </Text>
                <Flex
                  alignItems="center"
                  gap={2}
                >
                  <Text
                    textStyle="button-base"
                    color="neutral-7"
                  >
                    {formatCoin(asset?.balance, true, asset?.decimals, asset?.symbol, true)}
                  </Text>
                  {asset?.usdValue && (
                    <>
                      <Text
                        textStyle="button-base"
                        color="neutral-7"
                      >
                        {'•'}
                      </Text>
                      <Text
                        textStyle="button-base"
                        color="neutral-7"
                      >
                        {formatUSD(asset?.usdValue)}
                      </Text>
                    </>
                  )}
                </Flex>
              </Flex>
            </Flex>
            {isSelected && (
              <Icon
                as={CheckCircle}
                boxSize="1.5rem"
                color="lilac-0"
              />
            )}
          </MenuItem>
        );
      })}
    </>
  );
}

export function AssetSelector({ formIndex, disabled }: { formIndex: number; disabled?: boolean }) {
  const { t } = useTranslation(['roles', 'treasury', 'modals']);
  const { values, setFieldValue } = useFormikContext<RoleFormValues>();
  const selectedAsset = values.roleEditing?.payments?.[formIndex]?.asset;

  return (
    <>
      <FormControl
        my="0.5rem"
        isDisabled={disabled}
      >
        <Field name={`roleEditing.payments.${formIndex}.asset`}>
          {() => (
            <Menu
              placement="bottom-end"
              offset={[0, 8]}
            >
              {({ isOpen, onClose }) => (
                <>
                  <MenuButton
                    as={Button}
                    variant="unstyled"
                    bgColor="transparent"
                    isDisabled={disabled}
                    cursor={disabled ? 'not-allowed' : 'pointer'}
                    p={0}
                    sx={{
                      '&:hover': {
                        'payment-menu-asset': {
                          color: 'lilac--1',
                          bg: 'white-alpha-04',
                        },
                      },
                    }}
                  >
                    <Flex
                      alignItems="center"
                      gap="0.75rem"
                    >
                      <Flex
                        gap={2}
                        alignItems="center"
                        border="1px solid"
                        borderColor="neutral-3"
                        borderRadius="9999px"
                        w="fit-content"
                        className="payment-menu-asset"
                        p="0.5rem"
                      >
                        <Image
                          src={selectedAsset?.logo}
                          fallbackSrc="/images/coin-icon-default.svg"
                          boxSize="2.25rem"
                        />
                        <Text
                          textStyle="label-large"
                          color="white-0"
                        >
                          {selectedAsset?.symbol ?? t('selectLabel', { ns: 'modals' })}
                        </Text>
                      </Flex>
                      <Icon
                        as={CaretDown}
                        boxSize="1.5rem"
                      />
                    </Flex>
                  </MenuButton>
                  <Show below="lg">
                    <DraggableDrawer
                      isOpen={isOpen}
                      onOpen={() => {}}
                      onClose={onClose}
                      closeOnOverlayClick
                      headerContent={
                        <Flex
                          flexWrap="wrap"
                          gap="1rem"
                        >
                          <Text textStyle="display-lg">{t('titleAssets', { ns: 'treasury' })}</Text>
                          <Divider
                            variant="darker"
                            mx="-1.5rem"
                            width="calc(100% + 3rem)"
                          />
                        </Flex>
                      }
                    >
                      <Flex
                        gap="0.25rem"
                        padding="0.25rem"
                        mt="-1rem"
                      >
                        <AssetsList formIndex={formIndex} />
                      </Flex>
                    </DraggableDrawer>
                  </Show>
                  <Show above="lg">
                    <MenuList
                      zIndex={2}
                      bg="linear-gradient(0deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.04) 100%), #221D25"
                      pt="1rem"
                      boxShadow={CARD_SHADOW}
                      borderRadius="0.5rem"
                      px="0.25rem"
                      pb="0.25rem"
                      w={{ base: '300px', md: '428px' }}
                    >
                      <EaseOutComponent>
                        <Text
                          px="1rem"
                          textStyle="helper-text-small"
                          color="neutral-7"
                        >
                          {t('titleAssets', { ns: 'treasury' })}
                        </Text>
                        <Divider
                          variant="darker"
                          mt="1rem"
                          mb="0.25rem"
                          mx="-0.25rem"
                          width="calc(100% + 0.5rem)"
                        />
                        <AssetsList formIndex={formIndex} />
                      </EaseOutComponent>
                    </MenuList>
                  </Show>
                </>
              )}
            </Menu>
          )}
        </Field>
      </FormControl>
      <FormControl
        my="1rem"
        isDisabled={disabled}
      >
        <Field name={`roleEditing.payments.${formIndex}.amount`}>
          {({
            field,
            meta,
            form: { setFieldTouched },
          }: {
            field: FieldInputProps<BigIntValuePair>;
            meta: FieldMetaProps<BigIntValuePair>;
            form: FormikProps<RoleFormValues>;
          }) => {
            const paymentAmountBigIntError = meta.error as FormikErrors<BigIntValuePair>;
            const paymentAmountBigIntTouched = meta.touched;
            const inputDisabled = !values?.roleEditing?.payments?.[formIndex]?.asset || disabled;
            return (
              <LabelWrapper
                label={t('totalAmount')}
                labelColor="neutral-7"
                errorMessage={
                  !!paymentAmountBigIntTouched && paymentAmountBigIntError?.bigintValue
                    ? paymentAmountBigIntError?.bigintValue
                    : undefined
                }
              >
                <BigIntInput
                  isDisabled={inputDisabled}
                  value={field.value?.bigintValue}
                  parentFormikValue={values?.roleEditing?.payments?.[formIndex]?.amount}
                  onChange={valuePair => {
                    setFieldValue(`roleEditing.payments.${formIndex}.amount`, valuePair, true);
                  }}
                  decimalPlaces={values?.roleEditing?.payments?.[formIndex]?.asset?.decimals}
                  onBlur={() => {
                    setFieldTouched(`roleEditing.payments.${formIndex}.amount`, true);
                  }}
                  cursor={disabled ? 'not-allowed' : 'pointer'}
                  placeholder="0"
                />
              </LabelWrapper>
            );
          }}
        </Field>
      </FormControl>
    </>
  );
}
