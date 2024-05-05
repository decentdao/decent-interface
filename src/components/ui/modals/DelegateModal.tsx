import { Box, Button, Divider, Flex, SimpleGrid, Spacer, Text } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { Field, FieldAttributes, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { zeroAddress, getAddress } from 'viem';
import * as Yup from 'yup';
import { LockRelease__factory } from '../../../assets/typechain-types/dcnt';
import useDelegateVote from '../../../hooks/DAO/useDelegateVote';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import { useValidationAddress } from '../../../hooks/schemas/common/useValidationAddress';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../providers/App/AppProvider';
import { useEthersSigner } from '../../../providers/Ethers/hooks/useEthersSigner';
import { AzoriusGovernance, DecentGovernance } from '../../../types';
import { formatCoin } from '../../../utils/numberFormats';
import { couldBeENS } from '../../../utils/url';
import { AddressInput } from '../forms/EthAddressInput';
import EtherscanLinkAddress from '../links/EtherscanLinkAddress';

export function DelegateModal({ close }: { close: Function }) {
  const { t } = useTranslation(['modals', 'common']);

  const {
    governance,
    governanceContracts: { votesTokenContractAddress, lockReleaseContractAddress },
    readOnly: { user },
    action: { loadReadOnlyValues },
  } = useFractal();

  const baseContracts = useSafeContracts();

  const signer = useEthersSigner();
  const azoriusGovernance = governance as AzoriusGovernance;
  const decentGovernance = azoriusGovernance as DecentGovernance;
  const delegateeDisplayName = useDisplayName(azoriusGovernance?.votesToken?.delegatee);
  const lockedDelegateeDisplayName = useDisplayName(decentGovernance?.lockedVotesToken?.delegatee);
  const { delegateVote, contractCallPending } = useDelegateVote();
  const { addressValidationTest } = useValidationAddress();

  const submitDelegation = async (values: { address: string }) => {
    if (!votesTokenContractAddress || !baseContracts) return;
    let validAddress = values.address;
    if (couldBeENS(validAddress) && signer) {
      validAddress = getAddress(await signer.resolveName(values.address));
    }
    const votingTokenContract =
      baseContracts.votesERC20WrapperMasterCopyContract.asSigner.attach(votesTokenContractAddress);
    delegateVote({
      delegatee: validAddress,
      votingTokenContract,
      successCallback: () => {
        close();
      },
    });
  };
  const submitLockedDelegation = async (values: { address: string }) => {
    if (!lockReleaseContractAddress || !baseContracts || !signer) return;
    let validAddress = values.address;
    if (couldBeENS(validAddress)) {
      validAddress = await signer.resolveName(values.address);
    }
    const lockReleaseContract = LockRelease__factory.connect(lockReleaseContractAddress, signer);
    delegateVote({
      delegatee: validAddress,
      votingTokenContract: lockReleaseContract,
      successCallback: async () => {
        await loadReadOnlyValues();
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
            azoriusGovernance.votesToken.balance || 0n,
            false,
            azoriusGovernance.votesToken.decimals,
            azoriusGovernance.votesToken.symbol,
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
          {azoriusGovernance.votesToken.delegatee === zeroAddress ? (
            '--'
          ) : (
            <EtherscanLinkAddress address={azoriusGovernance.votesToken.delegatee}>
              {delegateeDisplayName.displayName}
            </EtherscanLinkAddress>
          )}
        </Text>
      </SimpleGrid>
      {decentGovernance.lockedVotesToken?.balance !== null &&
        decentGovernance.lockedVotesToken?.balance !== undefined && (
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
                decentGovernance.lockedVotesToken.balance || 0n,
                false,
                azoriusGovernance.votesToken.decimals,
                azoriusGovernance.votesToken.symbol,
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
              {decentGovernance.lockedVotesToken.delegatee === zeroAddress ? (
                '--'
              ) : (
                <EtherscanLinkAddress address={decentGovernance.lockedVotesToken.delegatee}>
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
                values.address === azoriusGovernance.votesToken?.delegatee
              }
            >
              {t('buttonDelegate')}
            </Button>
            {decentGovernance.lockedVotesToken?.balance !== null &&
              decentGovernance.lockedVotesToken?.balance !== undefined && (
                <Button
                  marginTop="2rem"
                  width="100%"
                  onClick={() => submitLockedDelegation({ address: values.address })}
                  isDisabled={
                    !!errors.address ||
                    contractCallPending ||
                    !values.address ||
                    values.address === decentGovernance.lockedVotesToken.delegatee
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
