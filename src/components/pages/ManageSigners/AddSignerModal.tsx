import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Select,
  Text,
  Image,
  Tooltip,
  Input,
} from '@chakra-ui/react';
import { LabelWrapper, SupportQuestion } from '@decent-org/fractal-ui';
import { Field, FieldAttributes, Formik } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSigner } from 'wagmi';
import * as Yup from 'yup';
import useDefaultNonce from '../../../hooks/DAO/useDefaultNonce';
import { useValidationAddress } from '../../../hooks/schemas/common/useValidationAddress';
import { useFractal } from '../../../providers/App/AppProvider';
import useAddSigner from './hooks/useAddSigner';

function AddSignerModal({ close, signers }: { close: () => void; signers: string[] }) {
  const {
    node: { daoAddress },
  } = useFractal();
  const [thresholdOptions, setThresholdOptions] = useState<number[]>();
  const [threshold, setThreshold] = useState<number>();
  const defaultNonce = useDefaultNonce();
  const { t } = useTranslation(['modals', 'common']);

  const { data: signer } = useSigner();
  const { addressValidationTest } = useValidationAddress();

  useEffect(() => {
    setThresholdOptions(Array.from({ length: signers.length + 1 }, (_, i) => i + 1));
  }, [signers]);

  const addSigner = useAddSigner();

  const onSubmit = async (values: { address: string }) => {
    let validAddress = values.address;
    if (validAddress.endsWith('.eth')) {
      validAddress = await signer!.resolveName(values.address);
    }

    await addSigner({
      newSigner: validAddress,
      threshold: threshold,
      nonce: defaultNonce,
      daoAddress: daoAddress,
      close: close,
    });
  };

  const delegationValidationSchema = Yup.object().shape({
    address: Yup.string().test(addressValidationTest),
  });

  return (
    <Box>
      <Formik
        initialValues={{
          address: '',
        }}
        onSubmit={onSubmit}
        validationSchema={delegationValidationSchema}
      >
        {({ handleSubmit, errors }) => (
          <form onSubmit={handleSubmit}>
            <Text
              textStyle="text-base-sans-regular"
              color="grayscale.100"
            >
              {t('addSignerLabel', { ns: 'modals' })}
            </Text>
            <Field name={'address'}>
              {({ field }: FieldAttributes<any>) => (
                <LabelWrapper
                  subLabel={t('addSignerSublabel', { ns: 'modals' })}
                  errorMessage={errors.address}
                >
                  <Input
                    placeholder="0x0000...0000"
                    {...field}
                  />
                </LabelWrapper>
              )}
            </Field>
            <Divider
              mt={6}
              mb={4}
              borderColor="chocolate.700"
            />
            <HStack>
              <Text
                textStyle="text-base-sans-regular"
                color="grayscale.100"
              >
                {t('updateThreshold', { ns: 'modals' })}
              </Text>
              <Flex>
                <Tooltip
                  label="Update signers"
                  maxW="18rem"
                  placement="left"
                >
                  <SupportQuestion
                    boxSize="1.5rem"
                    minWidth="auto"
                    mx="2"
                    mt="1"
                  />
                </Tooltip>
              </Flex>
            </HStack>
            <HStack>
              <Select
                onChange={e => setThreshold(Number(e.target.value))}
                placeholder={t('select', { ns: 'modals' })}
                mt={4}
                width="8rem"
                bgColor="#2c2c2c"
                borderColor="#4d4d4d"
                rounded="sm"
              >
                {thresholdOptions?.map(thresholdOption => (
                  <option
                    key={thresholdOption}
                    value={thresholdOption}
                  >
                    {thresholdOption}
                  </option>
                ))}
              </Select>
              <Flex>
                <Text
                  textStyle="text-sm-mono-regular"
                  color="grayscale.100"
                  mt={3}
                  ml={2}
                >{`out of ${signers.length + 1} signers required`}</Text>
              </Flex>
            </HStack>
            <HStack
              border="2px solid"
              borderColor="blue.500"
              textStyle="text-sm-mono-regular"
              rounded="md"
              px={2}
              py={3}
              mt={6}
            >
              <Image
                src="/images/alert-triangle.svg"
                alt="alert triangle"
                w="1rem"
                h="1rem"
                ml={3}
                mr={3}
                textColor="blue.500"
              />
              <Text>{t('updateSignerWarning', { ns: 'modals' })}</Text>
            </HStack>
            <Button
              type="submit"
              isDisabled={!!errors.address || !threshold}
              mt={6}
              width="100%"
            >
              {t('submit', { ns: 'modals' })}
            </Button>
          </form>
        )}
      </Formik>
    </Box>
  );
}

export default AddSignerModal;
