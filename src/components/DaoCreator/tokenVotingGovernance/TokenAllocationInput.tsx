import { Button, Input, NumberInput, NumberInputField } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { ethers, utils } from 'ethers';
import { useTranslation } from 'react-i18next';
import { checkAddress } from '../../../hooks/utils/useAddress';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import { useWeb3Provider } from '../../../providers/Web3Data/hooks/useWeb3Provider';
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

  const { limitDecimalsOnKeyDown } = useFormHelpers();

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
          value={tokenAllocation.address}
          placeholder={ethers.constants.AddressZero}
          onChange={event => updateAddress(event.target.value)}
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
        <NumberInput
          value={tokenAllocation.amount.value}
          onChange={tokenAmount => updateAmount(tokenAmount)}
          isInvalid={hasAmountError || !!tokenAllocation.addressError}
          data-testid="tokenVoting-tokenAllocationAmountInput"
          onKeyDown={e =>
            limitDecimalsOnKeyDown(e, tokenAllocation.amount.value, DEFAULT_TOKEN_DECIMALS)
          }
        >
          <NumberInputField />
        </NumberInput>
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
