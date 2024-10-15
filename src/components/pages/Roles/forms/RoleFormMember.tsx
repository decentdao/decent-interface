import {
  Box,
  Button,
  Flex,
  FormControl,
  Hide,
  Icon,
  Switch,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import {
  ArrowLineLeft,
  CalendarX,
  ClockCountdown,
  FileX,
  WarningDiamond,
} from '@phosphor-icons/react';
import { Field, FieldProps } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DETAILS_BOX_SHADOW } from '../../../../constants/common';
import DraggableDrawer from '../../../ui/containers/DraggableDrawer';
import { AddressInput } from '../../../ui/forms/EthAddressInput';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import { ModalBase } from '../../../ui/modals/ModalBase';
import { RoleFormValues } from '../types';

function RoleMemberWearerInput() {
  const { t } = useTranslation('roles');
  return (
    <FormControl>
      <Field name="roleEditing.wearer">
        {({
          field,
          form: { setFieldValue, setFieldTouched },
          meta,
        }: FieldProps<string, RoleFormValues>) => (
          <LabelWrapper
            label={t('member')}
            errorMessage={meta.touched && meta.error ? meta.error : undefined}
            isRequired
            labelColor="neutral-7"
          >
            <AddressInput
              value={field.value}
              onBlur={() => {
                setFieldTouched(field.name, true);
              }}
              onChange={e => {
                setFieldValue(field.name, e.target.value);
              }}
            />
          </LabelWrapper>
        )}
      </Field>
    </FormControl>
  );
}

function RoleMemberConfirmationScreen({
  onConfirmClick,
  onCancelClick,
}: {
  onConfirmClick: () => void;
  onCancelClick: () => void;
}) {
  const { t } = useTranslation(['roles', 'common']);
  return (
    <Flex justifyContent="center">
      <Flex
        flexDir="column"
        alignItems="center"
        gap={4}
        px={8}
        maxW="24rem"
      >
        <Icon
          as={ClockCountdown}
          boxSize="2.5rem"
          weight="fill"
          color="lilac-0"
        />
        <Text
          textStyle="display-2xl"
          textAlign="center"
        >
          {t('addTermLengthTitle')}
        </Text>
        <Flex
          flexDir="column"
          gap={4}
          mt="1.5rem"
        >
          <Flex
            gap={2}
            color="neutral-7"
          >
            <Icon
              as={CalendarX}
              boxSize="1.5rem"
              weight="fill"
            />
            <Text textStyle="body-base">{t('addTermConfirmationStatementDate')}</Text>
          </Flex>
          <Flex
            gap={2}
            color="neutral-7"
          >
            <Icon
              as={FileX}
              boxSize="1.5rem"
              weight="fill"
            />
            <Text>{t('addTermConfirmationStatementPayment')}</Text>
          </Flex>
          <Flex
            gap={2}
            color="neutral-7"
          >
            <Icon
              as={ArrowLineLeft}
              weight="fill"
              boxSize="1.5rem"
            />
            <Text>{t('addTermConfirmationStatementImmutable')}</Text>
          </Flex>
        </Flex>
        <Flex
          gap={4}
          mt="4rem"
          flexDir="column"
          w="full"
        >
          <Button
            w="full"
            onClick={onConfirmClick}
          >
            {t('confirm', { ns: 'common' })}
          </Button>
          <Button
            variant="secondaryRed"
            w="full"
            onClick={onCancelClick}
          >
            {t('cancel', { ns: 'common' })}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}

function RoleMemberConfirmationPortal({
  onConfirmClick,
  onCancelClick,
  isOpen,
  onOpen,
  onClose,
}: {
  onConfirmClick: () => void;
  onCancelClick: () => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <Hide above="md">
        <DraggableDrawer
          isOpen={isOpen}
          onClose={onClose}
          onOpen={onOpen}
          headerContent={null}
          initialHeight="75%"
          closeOnOverlayClick={false}
        >
          <RoleMemberConfirmationScreen
            onConfirmClick={onConfirmClick}
            onCancelClick={onCancelClick}
          />
        </DraggableDrawer>
      </Hide>
      <Hide below="md">
        <ModalBase
          isOpen
          title=""
          onClose={() => {}}
          isSearchInputModal={false}
        >
          <RoleMemberConfirmationScreen
            onConfirmClick={onConfirmClick}
            onCancelClick={onCancelClick}
          />
        </ModalBase>
      </Hide>
    </>
  );
}

function RoleFormMemberTermToggle() {
  const { t } = useTranslation('roles');
  const [seenConfirmation, setSeenConfirmation] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box
      padding="1.5rem"
      border="1px solid"
      borderColor="neutral-3"
      borderRadius="0.25rem"
      mt="1.5rem"
    >
      <Field name="roleEditing.isTermed">
        {({ field, form: { setFieldValue } }: FieldProps<boolean, RoleFormValues>) => (
          <>
            <Flex justifyContent="space-between">
              <Flex
                flexDir="column"
                w="15.625rem"
              >
                <Flex
                  alignItems="center"
                  gap={2}
                >
                  <Text textStyle="label-large">{t('addTermLengths')}</Text>
                  <Icon
                    size="1rem"
                    as={WarningDiamond}
                    weight="fill"
                  />
                </Flex>
                <Text
                  textStyle="label-small"
                  color="neutral-7"
                >
                  {t('addTermLengthSubTitle')}
                </Text>
              </Flex>
              <Box alignSelf="center">
                <Switch
                  name={field.name}
                  size="md"
                  variant="secondary"
                  onChange={e => {
                    if (!seenConfirmation) {
                      setFieldValue(field.name, false);
                      onOpen();
                    } else {
                      field.onChange(e);
                    }
                  }}
                  isChecked={field.value}
                />
              </Box>
            </Flex>
            <RoleMemberConfirmationPortal
              onConfirmClick={() => {
                setSeenConfirmation(true);
                setFieldValue(field.name, true);
                onClose();
              }}
              onCancelClick={() => {
                onClose();
              }}
              isOpen={isOpen}
              onOpen={onOpen}
              onClose={onClose}
            />
          </>
        )}
      </Field>
    </Box>
  );
}

export default function RoleFormMember() {
  return (
    <>
      <Box
        px={{ base: '1rem', md: 0 }}
        py="1rem"
        bg="neutral-2"
        boxShadow={{
          base: DETAILS_BOX_SHADOW,
          md: 'unset',
        }}
        borderRadius="0.5rem"
        display="flex"
        flexDirection="column"
        gap="1rem"
      >
        <RoleMemberWearerInput />
      </Box>
      <RoleFormMemberTermToggle />
    </>
  );
}
