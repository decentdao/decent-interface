import { Box, Button, Divider, Flex, SimpleGrid, Spacer, Text } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { BigNumber, constants } from 'ethers';
import { Field, FieldAttributes, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSigner } from 'wagmi';
import * as Yup from 'yup';
import useDelegateVote from '../../../hooks/DAO/useDelegateVote';
import { useValidationAddress } from '../../../hooks/schemas/common/useValidationAddress';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../providers/App/AppProvider';
import { DecentGovernance } from '../../../types';
import { formatCoin } from '../../../utils/numberFormats';
import { couldBeENS } from '../../../utils/url';
import { AddressInput } from '../forms/EthAddressInput';
import EtherscanLinkAddress from '../links/EtherscanLinkAddress';

export function DelegateModal({ close }: { close: Function }) {
  const { t } = useTranslation(['modals', 'common']);

  const {
    governance,
    governanceContracts: { tokenContract, lockReleaseContract },
    readOnly: { user },
  } = useFractal();

  const { data: signer } = useSigner();
  const azoriusGovernance = governance as DecentGovernance;
  const delegateeDisplayName = useDisplayName(azoriusGovernance?.votesToken.delegatee);
  const lockedDelegateeDisplayName = useDisplayName(azoriusGovernance?.lockedVotesToken?.delegatee);
  const { delegateVote, contractCallPending } = useDelegateVote();
  const { addressValidationTest } = useValidationAddress();

  const submitDelegation = async (values: { address: string }) => {
    if (!tokenContract) return;
    let validAddress = values.address;
    if (couldBeENS(validAddress)) {
      validAddress = await signer!.resolveName(values.address);
    }
    delegateVote({
      delegatee: validAddress,
      votingTokenContract: tokenContract?.asSigner,
      successCallback: () => {
        close();
      },
    });
  };
  const submitLockedDelegation = async (values: { address: string }) => {
    if (!lockReleaseContract) return;
    let validAddress = values.address;
    if (couldBeENS(validAddress)) {
      validAddress = await signer!.resolveName(values.address);
    }
    delegateVote({
      delegatee: validAddress,
      votingTokenContract: lockReleaseContract?.asSigner,
      successCallback: () => {
        close();
      },
    });
  };

  const delegationValidationSchema = Yup.object().shape({
    address: Yup.string().test(addressValidationTest),
  });

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
      {azoriusGovernance.lockedVotesToken?.balance && (
        <SimpleGrid
          columns={2}
          color="chocolate.200"
        >
          <Text
            align="start"
            marginBottom="0.5rem"
          >
            {t('titleLockedBalance')}
          </Text>
          <Text
            align="end"
            color="grayscale.100"
          >
            {formatCoin(
              azoriusGovernance.lockedVotesToken.balance || BigNumber.from(0),
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
            {azoriusGovernance.lockedVotesToken.delegatee === constants.AddressZero ? (
              '--'
            ) : (
              <EtherscanLinkAddress address={azoriusGovernance.lockedVotesToken.delegatee}>
                {lockedDelegateeDisplayName.displayName}
              </EtherscanLinkAddress>
            )}
          </Text>
        </SimpleGrid>
      )}
      <Divider
        color="chocolate.700"
        marginBottom="1rem"
      />
      <Formik
        initialValues={{
          address: '',
        }}
        onSubmit={submitDelegation}
        validationSchema={delegationValidationSchema}
      >
        {({ handleSubmit, setFieldValue, values, errors }) => (
          <form onSubmit={handleSubmit}>
            <Flex alignItems="center">
              <Text color="grayscale.100">{t('labelDelegateInput')}</Text>
              <Spacer />
              <Button
                pr={0}
                variant="text"
                textStyle="text-sm-sans-regular"
                color="gold.500-active"
                onClick={() => (user.address ? setFieldValue('address', user.address) : null)}
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
                  <AddressInput
                    data-testid="delegate-addressInput"
                    {...field}
                  />
                </LabelWrapper>
              )}
            </Field>
            <Button
              type="submit"
              marginTop="2rem"
              width="100%"
              isDisabled={
                !!errors.address ||
                contractCallPending ||
                !values.address ||
                azoriusGovernance.votesToken.balance?.isZero()
              }
            >
              {t('buttonDelegate')}
            </Button>
            {azoriusGovernance.lockedVotesToken?.balance && (
              <Button
                marginTop="2rem"
                width="100%"
                onClick={() => submitLockedDelegation({ address: values.address })}
                isDisabled={
                  !!errors.address ||
                  contractCallPending ||
                  !values.address ||
                  azoriusGovernance.lockedVotesToken.balance?.isZero()
                }
              >
                {t('buttonLockedDelegate')}
              </Button>
            )}
          </form>
        )}
      </Formik>
    </Box>
  );
}
