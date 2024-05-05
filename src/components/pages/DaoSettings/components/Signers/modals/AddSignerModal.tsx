import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Select,
  Text,
  Alert,
  AlertTitle,
  Image,
} from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { Field, FieldAttributes, Formik } from 'formik';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useValidationAddress } from '../../../../../../hooks/schemas/common/useValidationAddress';
import { useFractal } from '../../../../../../providers/App/AppProvider';
import { useEthersSigner } from '../../../../../../providers/Ethers/hooks/useEthersSigner';
import { couldBeENS } from '../../../../../../utils/url';
import SupportTooltip from '../../../../../ui/badges/SupportTooltip';
import { CustomNonceInput } from '../../../../../ui/forms/CustomNonceInput';
import { AddressInput } from '../../../../../ui/forms/EthAddressInput';
import useAddSigner from '../hooks/useAddSigner';

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
    node: { daoAddress, safe },
  } = useFractal();
  const { t } = useTranslation(['modals', 'common']);
  const signer = useEthersSigner();
  const { addressValidationTest, newSignerValidationTest } = useValidationAddress();
  const tooltipContainer = useRef<HTMLDivElement>(null);

  const addSigner = useAddSigner();

  const onSubmit = useCallback(
    async (values: { address: string; threshold: number; nonce: number }) => {
      const { address, nonce, threshold } = values;
      let validAddress = address;
      if (couldBeENS(validAddress) && signer) {
        validAddress = await signer.resolveName(address);
      }

      await addSigner({
        newSigner: validAddress,
        threshold: threshold,
        nonce: nonce,
        daoAddress: daoAddress,
        close: close,
      });
    },
    [addSigner, close, daoAddress, signer],
  );

  const addSignerValidationSchema = Yup.object().shape({
    address: Yup.string().test(addressValidationTest).test(newSignerValidationTest),
    nonce: Yup.number()
      .required()
      .moreThan((!!safe && safe.nonce - 1) || 0),
    threshold: Yup.number().required(),
    thresholdOptions: Yup.array().of(Yup.number()).required(),
  });

  return (
    <Box>
      <Formik
        initialValues={{
          address: '',
          nonce: safe?.nonce || 0,
          threshold: currentThreshold,
          thresholdOptions: Array.from({ length: signers.length + 1 }, (_, i) => i + 1),
        }}
        onSubmit={onSubmit}
        validationSchema={addSignerValidationSchema}
      >
        {({ handleSubmit, errors, values, setFieldValue }) => {
          return (
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
                    <AddressInput {...field} />
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
                <Flex ref={tooltipContainer}>
                  <SupportTooltip
                    containerRef={tooltipContainer}
                    label={t('updateSignersTooltip')}
                    mx="2"
                    mt="1"
                  />
                </Flex>
              </HStack>
              <HStack>
                <Select
                  onChange={e => setFieldValue('threshold', Number(e.target.value))}
                  mt={4}
                  width="8rem"
                  bgColor="#2c2c2c"
                  borderColor="#4d4d4d"
                  rounded="sm"
                  cursor="pointer"
                >
                  {values.thresholdOptions?.map(thresholdOption => (
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
                    { ns: 'modals' },
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
                nonce={values.nonce}
                onChange={newNonce => setFieldValue('nonce', newNonce ? newNonce : undefined)}
              />
              <Button
                type="submit"
                isDisabled={!!Object.keys(errors).length || !safe}
                mt={6}
                width="100%"
              >
                {t('createProposal', { ns: 'modals' })}
              </Button>
            </form>
          );
        }}
      </Formik>
    </Box>
  );
}

export default AddSignerModal;
