import {
  Box,
  Button,
  Flex,
  FormControl,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  NumberInput,
  NumberInputField,
  Text,
} from '@chakra-ui/react';
import {
  ArrowUpRight,
  CaretDown,
  CaretUp,
  CheckCircle,
  Info,
  Minus,
  Plus,
} from '@phosphor-icons/react';
import { Field, FieldProps, useFormikContext } from 'formik';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CARD_SHADOW, TOOLTIP_MAXW } from '../../../../constants/common';
import { useFractal } from '../../../../providers/App/AppProvider';
import { BigIntValuePair } from '../../../../types';
import { formatUSD } from '../../../../utils';
import { BigIntInput } from '../../../ui/forms/BigIntInput';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import ExternalLink from '../../../ui/links/ExternalLink';
import ModalTooltip from '../../../ui/modals/ModalTooltip';
import Divider from '../../../ui/utils/Divider';
import { EaseOutComponent } from '../../../ui/utils/EaseOutComponent';
import { RoleFormValues, frequencyAmountLabel, frequencyOptions } from '../types';

function SectionTitle({ title, subTitle }: { title: string; subTitle: string }) {
  const { t } = useTranslation(['common']);
  const titleRef = useRef<HTMLDivElement>(null);
  return (
    <Flex flexDir="column">
      <Flex
        justifyContent="space-between"
        alignItems="center"
      >
        <Box ref={titleRef}>
          <ModalTooltip
            containerRef={titleRef}
            maxW={TOOLTIP_MAXW}
            // @todo add COPY
            label="I need copy"
          >
            <Flex
              alignItems="center"
              gap="0.25rem"
            >
              <Text
                textStyle="display-lg"
                color="white-0"
              >
                {title}
              </Text>
              <Icon as={Info} />
            </Flex>
          </ModalTooltip>
        </Box>
        <ExternalLink href="#">
          <Flex
            alignItems="center"
            gap="0.25rem"
          >
            {t('learnMore')}
            <Icon
              as={ArrowUpRight}
              boxSize="1rem"
            />
          </Flex>
        </ExternalLink>
      </Flex>
      <Text
        textStyle="label-base"
        color="neutral-7"
      >
        {subTitle}
      </Text>
    </Flex>
  );
}

function AssetSelector() {
  const { t } = useTranslation(['roles', 'treasury', 'modals']);
  const {
    treasury: { assetsFungible },
  } = useFractal();
  const fungibleAssetsWithBalance = assetsFungible.filter(asset => parseFloat(asset.balance) > 0);
  const { values, setFieldValue } = useFormikContext<RoleFormValues>();
  const selectedAsset = values.roleEditing?.payroll?.asset;
  return (
    <>
      <FormControl my="0.5rem">
        <Field name="roleEditing.payroll.asset">
          {({ field }: FieldProps<string, RoleFormValues>) => (
            <Menu
              placement="bottom-end"
              offset={[0, 8]}
            >
              <>
                <MenuButton
                  as={Button}
                  variant="unstyled"
                  bgColor="transparent"
                  p={0}
                  sx={{
                    '&:hover': {
                      'div.payroll-menu-asset': {
                        color: 'lilac--1',
                        bg: 'white-alpha-04',
                      },
                    },
                  }}
                >
                  <Flex
                    alignItems="center"
                    gap={2}
                  >
                    <Flex
                      gap={2}
                      alignItems="center"
                      border="1px solid"
                      borderColor="neutral-3"
                      borderRadius="9999px"
                      w="fit-content"
                      px="1rem"
                      className="payroll-menu-asset"
                      py="0.5rem"
                    >
                      <Image
                        src={selectedAsset?.logo}
                        fallbackSrc="/images/coin-icon-default.svg"
                        boxSize="2rem"
                      />
                      <Text
                        textStyle="label-base"
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
                <MenuList
                  zIndex={1}
                  bg="linear-gradient(0deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.04) 100%), #221D25"
                  py="1rem"
                  boxShadow={CARD_SHADOW}
                  borderRadius="0.5rem"
                  px="0.25rem"
                  w={{ base: '300px', md: '428px' }}
                >
                  <EaseOutComponent>
                    <Text
                      textStyle="display-lg"
                      px="1rem"
                    >
                      {t('titleAssets', { ns: 'treasury' })}
                    </Text>
                    <Divider
                      variant="darker"
                      my="1rem"
                    />
                    {fungibleAssetsWithBalance.map((asset, index) => {
                      const isSelected = selectedAsset?.address === asset.tokenAddress;
                      return (
                        <MenuItem
                          key={index}
                          p="1rem"
                          _hover={{ bg: 'neutral-4' }}
                          display="flex"
                          alignItems="center"
                          gap={2}
                          justifyContent="space-between"
                          w="full"
                          onClick={() => {
                            setFieldValue(field.name, {
                              address: fungibleAssetsWithBalance[index].tokenAddress,
                              symbol: fungibleAssetsWithBalance[index].symbol,
                              logo: fungibleAssetsWithBalance[index].logo,
                              balance: fungibleAssetsWithBalance[index].balance,
                              balanceFormatted: fungibleAssetsWithBalance[index].balanceFormatted,
                              decimals: fungibleAssetsWithBalance[index].decimals,
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
                                {asset.symbol}
                              </Text>
                              <Flex
                                alignItems="center"
                                gap={2}
                              >
                                <Text
                                  textStyle="button-base"
                                  color="neutral-7"
                                >
                                  {asset.balanceFormatted}
                                </Text>
                                <Text
                                  textStyle="button-base"
                                  color="neutral-7"
                                >
                                  {asset.symbol}
                                </Text>
                                {asset.usdValue && (
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
                                      {formatUSD(asset.usdValue)}
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
                  </EaseOutComponent>
                </MenuList>
              </>
            </Menu>
          )}
        </Field>
      </FormControl>
      <FormControl my="1rem">
        <Field name="roleEditing.payroll.amount">
          {({
            field,
            meta,
            form: { setFieldTouched },
          }: FieldProps<BigIntValuePair, RoleFormValues>) => {
            return (
              <LabelWrapper
                label={t('totalAmount')}
                errorMessage={meta.error}
              >
                <BigIntInput
                  isDisabled={!values?.roleEditing?.payroll?.asset}
                  value={field.value?.bigintValue}
                  onChange={valuePair => {
                    setFieldValue(field.name, valuePair, true);
                  }}
                  onBlur={() => {
                    setFieldTouched(field.name, true);
                  }}
                />
              </LabelWrapper>
            );
          }}
        </Field>
      </FormControl>
    </>
  );
}

function FrequencySelector() {
  const { t } = useTranslation(['roles']);
  return (
    <FormControl my="1rem">
      <Field name="roleEditing.payroll.paymentFrequency">
        {({ field, form: { setFieldValue } }: FieldProps<string, RoleFormValues>) => {
          const inputValue = field.value ? t(frequencyOptions[field.value]) : 'Select';
          return (
            <LabelWrapper label={t('frequency')}>
              <Menu
                placement="bottom-end"
                offset={[0, 8]}
                size="100%"
                matchWidth
              >
                {({ isOpen }) => (
                  <>
                    <MenuButton
                      as={Button}
                      variant="unstyled"
                      p="0"
                      w="full"
                    >
                      <InputGroup>
                        <Input
                          bg="neutral-2"
                          boxShadow="0px 0px 0px 1px #100414, 0px 0px 0px 1px rgba(248, 244, 252, 0.04) inset, 0px 1px 0px 0px rgba(248, 244, 252, 0.04) inset"
                          value={inputValue}
                        />
                        <InputRightElement>
                          <Icon as={isOpen ? CaretUp : CaretDown} />
                        </InputRightElement>
                      </InputGroup>
                    </MenuButton>
                    <MenuList
                      zIndex={1}
                      bg="neutral-2"
                      py="0.5rem"
                      boxShadow={CARD_SHADOW}
                      borderRadius="0.5rem"
                      px="0.25rem"
                      w="100%"
                    >
                      <EaseOutComponent>
                        {Object.entries(frequencyOptions).map(([key, value]) => (
                          <MenuItem
                            key={key}
                            w="full"
                            p="1rem"
                            _hover={{ color: 'lilac--1', bg: 'white-alpha-04' }}
                            textStyle="input-text"
                            onClick={() => {
                              setFieldValue(field.name, key);
                            }}
                          >
                            {t(value)}
                          </MenuItem>
                        ))}
                      </EaseOutComponent>
                    </MenuList>
                  </>
                )}
              </Menu>
            </LabelWrapper>
          );
        }}
      </Field>
    </FormControl>
  );
}

function PaymentStartDatePicker() {
  // @todo implement date picker
  const { t } = useTranslation(['roles']);
  return (
    <FormControl my="1rem">
      <Field>
        {({ field }: FieldProps<string, RoleFormValues>) => (
          <LabelWrapper
            label={t('paymentStart')}
            tooltipContent={<Box></Box>}
          >
            <Input
              value={field.value}
              onChange={() => ''}
            />
          </LabelWrapper>
        )}
      </Field>
    </FormControl>
  );
}

function PaymentFrequencyAmount() {
  const { t } = useTranslation(['roles']);
  return (
    <FormControl my="1rem">
      <Field name="roleEditing.payroll.paymentFrequencyNumber">
        {({ field, form: { setFieldValue, values }, meta }: FieldProps<string, RoleFormValues>) => {
          const paymentFrequency = values.roleEditing?.payroll?.paymentFrequency;
          const frequencyLabel = !!paymentFrequency
            ? t(frequencyAmountLabel[paymentFrequency])
            : '';
          return (
            <LabelWrapper
              label={frequencyLabel}
              tooltipContent={<Box></Box>}
              errorMessage={meta.error && meta.touched ? meta.error : undefined}
            >
              <Flex gap="0.25rem">
                <IconButton
                  aria-label="stepper-minus"
                  minW="40px"
                  h="40px"
                  variant="stepper"
                  icon={
                    <Icon
                      as={Minus}
                      boxSize="1rem"
                    />
                  }
                  onClick={() => {
                    if (field.value === undefined || Number(field.value) <= 0) return;
                    setFieldValue(field.name, Number(field.value) - 1);
                  }}
                />
                <NumberInput w="full">
                  <NumberInputField
                    value={field.value}
                    onChange={() => {
                      setFieldValue(field.name, field.value);
                    }}
                  />
                </NumberInput>
                <IconButton
                  aria-label="stepper-plus"
                  minW="40px"
                  h="40px"
                  variant="stepper"
                  icon={
                    <Icon
                      as={Plus}
                      boxSize="1rem"
                    />
                  }
                  onClick={() => {
                    if (field.value === undefined) {
                      setFieldValue(field.name, 1);
                      return;
                    }
                    setFieldValue(field.name, Number(field.value) + 1);
                  }}
                />
              </Flex>
            </LabelWrapper>
          );
        }}
      </Field>
    </FormControl>
  );
}

export default function RoleFormPayroll() {
  const { t } = useTranslation(['roles']);
  const { values } = useFormikContext<RoleFormValues>();
  return (
    <Box
      px={{ base: '1rem', md: 0 }}
      py="1rem"
      bg="neutral-2"
      boxShadow={{
        base: CARD_SHADOW,
        md: 'unset',
      }}
      borderRadius="0.5rem"
    >
      <SectionTitle
        title={t('asset')}
        subTitle={t('assetSubTitle')}
      />
      <AssetSelector />
      <SectionTitle
        title={t('paymentFrequency')}
        subTitle={t('paymentFrequencySubtitle')}
      />
      <FrequencySelector />
      {values.roleEditing?.payroll?.paymentFrequency && (
        <>
          <PaymentStartDatePicker />
          <PaymentFrequencyAmount />
        </>
      )}
    </Box>
  );
}
