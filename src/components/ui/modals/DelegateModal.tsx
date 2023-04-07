import { Box, Button, Divider, Flex, Input, SimpleGrid, Spacer, Text } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { BigNumber, constants } from 'ethers';
import { Field, FieldAttributes, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useAccount, useSigner } from 'wagmi';
import * as Yup from 'yup';
import useDelegateVote from '../../../hooks/DAO/useDelegateVote';
import { useValidationAddress } from '../../../hooks/schemas/common/useValidationAddress';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../providers/App/AppProvider';
import { AzoriusGovernance } from '../../../types';
import { formatCoin } from '../../../utils/numberFormats';
import EtherscanLinkAddress from '../links/EtherscanLinkAddress';

export function DelegateModal({ close }: { close: Function }) {
  const { t } = useTranslation(['modals', 'common']);

  const {
    governance,
    governanceContracts: { tokenContract },
  } = useFractal();
  const { address: account } = useAccount();

  const { data: signer } = useSigner();
  const azoriusGovernance = governance as AzoriusGovernance;
  const delegateeDisplayName = useDisplayName(azoriusGovernance?.votesToken.delegatee);
  const { delegateVote, contractCallPending } = useDelegateVote();
  const { addressValidationTest } = useValidationAddress();

  if (!azoriusGovernance.votesToken) return null;

  return (
    <Box>
      <SimpleGrid
        columns={2}
        color="chocolate.200"
      >
        <Text
          align="start"
          marginBottom="0.5rem"
        >
          {t('titleBalance')}
        </Text>
        <Text
          align="end"
          color="grayscale.100"
        >
          {formatCoin(
            azoriusGovernance.votesToken.balance || BigNumber.from(0),
            false,
            azoriusGovernance.votesToken.decimals,
            azoriusGovernance.votesToken.symbol
          )}
        </Text>
        <Text
          align="start"
          marginBottom="0.5rem"
        >
          {t('titleWeight')}
        </Text>
        <Text
          align="end"
          color="grayscale.100"
        >
          {formatCoin(
            azoriusGovernance.votesToken.votingWeight || BigNumber.from(0),
            false,
            azoriusGovernance.votesToken.decimals,
            azoriusGovernance.votesToken.symbol
          )}
        </Text>
        <Text
          align="start"
          marginBottom="1rem"
        >
          {t('titleDelegatedTo')}
        </Text>
        <Text
          align="end"
          color="grayscale.100"
        >
          {azoriusGovernance.votesToken.delegatee === constants.AddressZero ? (
            '--'
          ) : (
            <EtherscanLinkAddress address={azoriusGovernance.votesToken.delegatee}>
              {delegateeDisplayName.displayName}
            </EtherscanLinkAddress>
          )}
        </Text>
      </SimpleGrid>
      <Divider
        color="chocolate.700"
        marginBottom="1rem"
      />
      <Formik
        initialValues={{
          address: '',
        }}
        onSubmit={async function (values) {
          if (!tokenContract) return;
          let validAddress = values.address;
          if (validAddress.endsWith('.eth')) {
            validAddress = await signer!.resolveName(values.address);
          }
          delegateVote({
            delegatee: validAddress,
            votingTokenContract: tokenContract?.asSigner,
            successCallback: () => {
              close();
            },
          });
        }}
        validationSchema={Yup.object().shape({
          address: Yup.string().test(addressValidationTest),
        })}
      >
        {({ handleSubmit, setFieldValue, errors }) => (
          <form onSubmit={handleSubmit}>
            <Flex alignItems="center">
              <Text color="grayscale.100">{t('labelDelegateInput')}</Text>
              <Spacer />
              <Button
                pr={0}
                variant="text"
                textStyle="text-sm-sans-regular"
                color="gold.500-active"
                onClick={() => (account ? setFieldValue('address', account) : null)}
              >
                {t('linkSelfDelegate')}
              </Button>
            </Flex>
            <Field name={'address'}>
              {({ field }: FieldAttributes<any>) => (
                <LabelWrapper
                  subLabel={t('sublabelDelegateInput')}
                  errorMessage={errors.address}
                >
                  <Input
                    data-testid="delegate-addressInput"
                    placeholder="0x0000...0000"
                    {...field}
                  />
                </LabelWrapper>
              )}
            </Field>
            <Button
              type="submit"
              marginTop="2rem"
              width="100%"
              isDisabled={!!errors.address || contractCallPending}
            >
              {t('buttonDelegate')}
            </Button>
          </form>
        )}
      </Formik>
    </Box>
  );
}
