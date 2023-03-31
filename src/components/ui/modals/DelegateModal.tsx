import { Box, Button, Divider, Flex, SimpleGrid, Spacer, Text } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { BigNumber, constants } from 'ethers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import useDelegateVote from '../../../hooks/DAO/useDelegateVote';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../providers/App/AppProvider';
import { AzoriusGovernance } from '../../../types';
import { formatCoin } from '../../../utils/numberFormats';
import { EthAddressInput } from '../forms/EthAddressInput';
import EtherscanLinkAddress from '../links/EtherscanLinkAddress';

export function DelegateModal({ close }: { close: Function }) {
  // the state of the Eth address input, which can be different
  // from the actual address being submitted (in the case of ENS)
  const [inputValue, setInputValue] = useState<string>('');
  // the ETH address being delegated to. Not necessarily the state
  // of the address input
  const [newDelegatee, setNewDelegatee] = useState<string>('');
  const { t } = useTranslation(['modals', 'common']);
  const [pending, setPending] = useState<boolean>(false);

  const {
    governance,
    governanceContracts: { tokenContract },
  } = useFractal();
  const { address: account } = useAccount();
  const azoriusGovernance = governance as AzoriusGovernance;
  const [isValidAddress, setIsValidAddress] = useState<boolean>(false);
  const delegateeDisplayName = useDisplayName(azoriusGovernance?.votesToken.delegatee);
  const delegateVote = useDelegateVote({
    delegatee: newDelegatee,
    votingTokenContract: tokenContract?.asSigner,
    setPending: setPending,
  });

  const delegateSelf = () => {
    if (account) setInputValue(account);
  };

  const onDelegateClick = () => {
    delegateVote();
    if (close) close();
  };

  const errorMessage =
    inputValue != '' && isValidAddress === false
      ? t('errorInvalidAddress', { ns: 'common' })
      : undefined;

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
      <Flex alignItems="center">
        <Text color="grayscale.100">{t('labelDelegateInput')}</Text>
        <Spacer />
        <Button
          pr={0}
          variant="text"
          textStyle="text-sm-sans-regular"
          color="gold.500-active"
          onClick={delegateSelf}
        >
          {t('linkSelfDelegate')}
        </Button>
      </Flex>
      <LabelWrapper
        subLabel={t('sublabelDelegateInput')}
        errorMessage={errorMessage}
      >
        <EthAddressInput
          data-testid="delegate-addressInput"
          value={inputValue}
          setValue={setInputValue}
          onAddressChange={function (address: string, isValid: boolean): void {
            setNewDelegatee(address);
            setIsValidAddress(isValid);
          }}
        />
      </LabelWrapper>
      <Button
        marginTop="2rem"
        width="100%"
        isDisabled={!isValidAddress || newDelegatee.trim() === '' || pending}
        onClick={onDelegateClick}
      >
        {t('buttonDelegate')}
      </Button>
    </Box>
  );
}
