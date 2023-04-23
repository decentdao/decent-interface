import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Select,
  Text,
  Tooltip,
  Input,
  Alert,
  AlertTitle,
  Image,
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
import { CustomNonceInput } from '../../ui/forms/CustomNonceInput';
import useAddSigner from './hooks/useAddSigner';

function AddSignerModal({
  close,
  signers,
  currentThreshold,
}: {
  close: () => void;
  signers: string[];
  currentThreshold: number;
}) {
  const {
    node: { daoAddress },
  } = useFractal();
  const [thresholdOptions, setThresholdOptions] = useState<number[]>();
  const [threshold, setThreshold] = useState<number>(currentThreshold);
  const defaultNonce = useDefaultNonce();
  const [nonce, setNonce] = useState<number | undefined>();
  const { t } = useTranslation(['modals', 'common']);

  const { data: signer } = useSigner();
  const { addressValidationTest, newSignerValidationTest } = useValidationAddress();

  useEffect(() => {
    if (nonce === undefined && !!defaultNonce) {
      setNonce(defaultNonce);
    }
  }, [defaultNonce, nonce]);

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
      nonce: nonce,
      daoAddress: daoAddress,
      close: close,
    });
  };

  const addressValidationSchema = Yup.object().shape({
    address: Yup.string().test(addressValidationTest).test(newSignerValidationTest),
  });

  return (
    <Box>
      <Formik
        initialValues={{
          address: '',
        }}
        onSubmit={onSubmit}
        validationSchema={addressValidationSchema}
      >
        {({ handleSubmit, errors, values }) => (
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
                  errorMessage={field.value && errors.address}
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
              color="chocolate.700"
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
                  // defaultIsOpen={true}
                  // zIndex={1900}
                  style={{ zIndex: 1500 }}
                  closeDelay={100000}
                  // portalProps={}
                  shouldWrapChildren={true}
                  offset={[200, 160]}
                  // portalProps={zIndex=9999}
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
                mt={4}
                width="8rem"
                bgColor="#2c2c2c"
                borderColor="#4d4d4d"
                rounded="sm"
                cursor="pointer"
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
                >{`${t('signersRequired1', { ns: 'modals' })} ${signers.length + 1} ${t(
                  'signersRequired2',
                  { ns: 'modals' }
                )}`}</Text>
              </Flex>
            </HStack>
            <Alert
              status="info"
              w="fit-full"
              mt={6}
            >
              <Image
                src="/images/alert-triangle.svg"
                alt="alert triangle"
                w="1.5rem"
                h="1.5rem"
                ml={3}
                mr={3}
                textColor="blue.500"
              />
              <AlertTitle>
                <Text
                  textStyle="text-sm-mono-regular"
                  whiteSpace="pre-wrap"
                >
                  {t('updateSignerWarning', { ns: 'modals' })}
                </Text>
              </AlertTitle>
            </Alert>
            <Divider
              color="chocolate.700"
              mt={6}
              mb={6}
            />
            <CustomNonceInput
              nonce={nonce}
              onChange={newNonce => setNonce(newNonce ? newNonce : undefined)}
              defaultNonce={defaultNonce}
            />
            <Button
              type="submit"
              isDisabled={!values.address || !!errors.address || !threshold}
              mt={6}
              width="100%"
            >
              {t('createProposal', { ns: 'modals' })}
            </Button>
          </form>
        )}
      </Formik>
    </Box>
  );
}

export default AddSignerModal;
