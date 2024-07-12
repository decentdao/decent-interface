import { Box, Flex, FormControl, Icon, IconButton, Input, Select, Text } from '@chakra-ui/react';
import { ArrowUpRight, CaretDown, Info, Minus, Plus } from '@phosphor-icons/react';
import { Field, FieldProps } from 'formik';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CARD_SHADOW, TOOLTIP_MAXW } from '../../../../constants/common';
import { BigIntValuePair } from '../../../../types';
import { BigIntInput } from '../../../ui/forms/BigIntInput';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import ExternalLink from '../../../ui/links/ExternalLink';
import ModalTooltip from '../../../ui/modals/ModalTooltip';
import { RoleFormValues } from '../types';

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
  const { t } = useTranslation(['roles']);
  return (
    <>
      <FormControl my="0.5rem">
        <Field name="selectedAsset">
          {({ field }: FieldProps<string, RoleFormValues>) => (
            <Select
              bgColor="neutral-1"
              borderColor="neutral-3"
              rounded="sm"
              w="fit-content"
              cursor="pointer"
              iconSize="1.5rem"
              icon={<CaretDown />}
              onChange={e => {
                // setFieldValue('inputAmount', { value: '0', bigintValue: 0n });
                // setFieldValue('selectedAsset', fungibleAssetsWithBalance[Number(e.target.value)]);
              }}
              value={0}
            >
              {[].map((asset, index) => (
                <option
                  key={index}
                  value={index}
                >
                  {asset}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </FormControl>
      <FormControl my="1rem">
        <Field>
          {({
            field,
            form: { setFieldValue },
            meta,
          }: FieldProps<BigIntValuePair, RoleFormValues>) => (
            <LabelWrapper
              // @todo - add translation
              label={t('totalAmount')}
            >
              <BigIntInput
                // @todo - add translation
                value={field.value.bigintValue}
                onChange={() => {}}
              />
            </LabelWrapper>
          )}
        </Field>
      </FormControl>
    </>
  );
}

function FrequencySelector() {
  const { t } = useTranslation(['roles']);
  return (
    <FormControl my="1rem">
      <Field name="selectedAsset">
        {({ field }: FieldProps<string, RoleFormValues>) => (
          <LabelWrapper label={t('frequency')}>
            <Select
              bgColor="neutral-2"
              border="none"
              borderRadius="4px"
              rounded="sm"
              cursor="pointer"
              iconSize="1.5rem"
              icon={<CaretDown />}
              boxShadow="0px 0px 0px 1px #100414, 0px 0px 0px 1px rgba(248, 244, 252, 0.04) inset, 0px 1px 0px 0px rgba(248, 244, 252, 0.04) inset"
              onChange={e => {
                // setFieldValue('inputAmount', { value: '0', bigintValue: 0n });
                // setFieldValue('selectedAsset', fungibleAssetsWithBalance[Number(e.target.value)]);
              }}
              value={0}
            >
              {[].map((asset, index) => (
                <option
                  key={index}
                  value={index}
                >
                  {asset}
                </option>
              ))}
            </Select>
          </LabelWrapper>
        )}
      </Field>
    </FormControl>
  );
}

function PaymentStartDatePicker() {
  const { t } = useTranslation(['roles']);
  return (
    <FormControl my="1rem">
      <Field>
        {({ field, form: { setFieldValue }, meta }: FieldProps<string, RoleFormValues>) => (
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
  // ? @todo Will this label change based on the choice of frequency?
  const frequencyLabel = t('frequency');
  return (
    <FormControl my="1rem">
      <Field>
        {({ field, form: { setFieldValue }, meta }: FieldProps<string, RoleFormValues>) => (
          <LabelWrapper
            label={frequencyLabel}
            tooltipContent={<Box></Box>}
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
              />
              <Input
                value={field.value}
                onChange={() => ''}
              />
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
              />
            </Flex>
          </LabelWrapper>
        )}
      </Field>
    </FormControl>
  );
}

export default function RoleFormPayroll() {
  const { t } = useTranslation(['roles']);
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
        subTitle={t('paymentFrequencySubTitle')}
      />
      <FrequencySelector />
      <PaymentStartDatePicker />
      <PaymentFrequencyAmount />
    </Box>
  );
}
