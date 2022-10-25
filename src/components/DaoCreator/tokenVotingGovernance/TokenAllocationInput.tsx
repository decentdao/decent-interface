import { TokenAllocation } from '../../../types/tokenAllocation';
import { checkAddress } from '../../../hooks/useAddress';
import { TextButton } from '../../ui/forms/Button';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { DEFAULT_TOKEN_DECIMALS } from '../provider/constants';
import { utils } from 'ethers';
import { useTranslation } from 'react-i18next';
import { Button, Input, LabelWrapper, RestrictCharTypes } from '@decent-org/fractal-ui';

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
          containerClassName="col-start-1 col-span-4 md:col-span-5 w-full my-auto"
          type="text"
          value={tokenAllocation.address}
          onChange={event => updateAddress(event.target.value)}
          width="full"
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
          containerClassName="col-span-2 md:pt-0 my-auto"
          type="number"
          value={tokenAllocation.amount.value}
          onChange={event => updateAmount(event.target.value)}
          restrictChar={RestrictCharTypes.FLOAT_NUMBERS}
          decimals={DEFAULT_TOKEN_DECIMALS}
        />
      </LabelWrapper>
      <Button
        variant="text"
        type="button"
        onClick={() => removeTokenAllocation(index)}
        px="0px"
      >
        {t('remove')}
      </Button>
    </>
  );
}

export default TokenAllocationInput;
