import { Box, Button, Flex } from '@chakra-ui/react';
import { Plus } from '@phosphor-icons/react';
import { FieldArray, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { RoleFormValues } from '../types';
import RoleFormPaymentStream from './RoleFormPaymentStream';

export function RoleFormPaymentStreams() {
  const { t } = useTranslation(['roles']);
  const { values, setFieldValue } = useFormikContext<RoleFormValues>();
  const payments = values.roleEditing?.payments;

  if (values.roleEditing?.roleEditingPaymentIndex !== undefined) {
    return <RoleFormPaymentStream formIndex={values.roleEditing?.roleEditingPaymentIndex} />;
  }

  return (
    <FieldArray name="roleEditing.payments">
      {({ push: pushPayment }) => (
        <Box>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus />}
            onClick={() => {
              pushPayment({
                scheduleType: 'duration',
              });
              setFieldValue('roleEditing.roleEditingPaymentIndex', payments?.length);
            }}
          >
            {t('addPayment')}
          </Button>
          <Box>
            {payments?.map((payment, index) => (
              <Flex key={index}>
                {/* @todo replace with Actual component */}
                <Flex
                  flexDir="column"
                  gap="0.5rem"
                  my="1rem"
                  p="1rem"
                  border="1px solid"
                  borderRadius="md"
                  borderColor="white-0"
                  cursor="pointer"
                  onClick={() => {
                    setFieldValue('roleEditing.roleEditingPaymentIndex', index);
                  }}
                >
                  {payment.streamId}
                </Flex>
              </Flex>
            ))}
          </Box>
        </Box>
      )}
    </FieldArray>
  );
}
