import { Button, Input, LabelWrapper, RestrictCharTypes } from '@decent-org/fractal-ui';
import { utils } from 'ethers';
import { useTranslation } from 'react-i18next';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { checkAddress } from '../../../hooks/utlities/useAddress';
import { TokenAllocation } from '../../../types/tokenAllocation';
import { DEFAULT_TOKEN_DECIMALS } from '../provider/constants';

interface TokenAllocationProps {
  index: number;
  tokenAllocation: TokenAllocation;
  hasAmountError: boolean;
  updateTokenAllocation: (index: number, tokenAllocation: TokenAllocation) => void;
  removeTokenAllocation: (index: number) => void;
}

function TokenAllocationInput({
  index,
  tokenAllocation,
  hasAmountError,
  updateTokenAllocation,
  removeTokenAllocation,
}: TokenAllocationProps) {
  const {
    state: { provider },
  } = useWeb3Provider();

  const { t } = useTranslation(['common', 'daoCreate']);

  const updateAddress = async (address: string) => {
    let isValidAddress = false;
    if (address.trim()) {
      isValidAddress = await checkAddress(provider, address);
    }
    let errorMsg = undefined;
    if (!isValidAddress) {
      if (!provider && address.includes('.')) {
        // simple check if this might be an ENS address
        errorMsg = t('errorConnectWallet', { ns: 'daoCreate' });
      } else if (address.trim()) {
        errorMsg = t('errorInvalidAddress');
      }
    }
    updateTokenAllocation(index, {
      address: address,
      isValidAddress: isValidAddress,
      amount: tokenAllocation.amount,
      addressError: errorMsg,
    });
  };

  const updateAmount = (value: string) => {
    updateTokenAllocation(index, {
      address: tokenAllocation.address,
      isValidAddress: tokenAllocation.isValidAddress,
      amount: { value, bigNumberValue: utils.parseUnits(value || '0', DEFAULT_TOKEN_DECIMALS) },
      addressError: tokenAllocation.addressError,
    });
  };

  return (
    <>
      <LabelWrapper
        errorMessage={
          tokenAllocation.addressError
            ? tokenAllocation.addressError
            : hasAmountError
            ? '‎'
            : undefined
        }
      >
        <Input
          size="base"
          type="text"
          value={tokenAllocation.address}
          onChange={event => updateAddress(event.target.value)}
          width="full"
          data-testid="tokenVoting-tokenAllocationAddressInput"
        />
      </LabelWrapper>
      <LabelWrapper
        errorMessage={
          hasAmountError
            ? t('errorOverallocated', { ns: 'daoCreate' })
            : tokenAllocation.addressError
            ? '‎'
            : undefined
        }
      >
        <Input
          size="base"
          type="number"
          isInvalid={hasAmountError || !!tokenAllocation.addressError}
          value={tokenAllocation.amount.value}
          onChange={event => updateAmount(event.target.value)}
          restrictChar={RestrictCharTypes.FLOAT_NUMBERS}
          decimals={DEFAULT_TOKEN_DECIMALS}
          data-testid="tokenVoting-tokenAllocationAmountInput"
        />
      </LabelWrapper>
      <Button
        variant="text"
        type="button"
        onClick={() => removeTokenAllocation(index)}
        px="0px"
        data-testid="tokenVoting-tokenAllocationRemoveButton"
      >
        {t('remove')}
      </Button>
    </>
  );
}

export default TokenAllocationInput;
