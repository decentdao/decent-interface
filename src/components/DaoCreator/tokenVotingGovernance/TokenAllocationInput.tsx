import { TokenAllocation } from '../../../types/tokenAllocation';
import { checkAddress } from '../../../hooks/useAddress';
import { TextButton } from '../../ui/forms/Button';
import Input, { RestrictCharTypes } from '../../ui/forms/Input';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { DEFAULT_TOKEN_DECIMALS } from '../provider/constants';
import { utils } from 'ethers';

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

  const updateAddress = async (address: string) => {
    let isValidAddress = false;
    if (address.trim()) {
      isValidAddress = await checkAddress(provider, address);
    }
    let errorMsg = undefined;
    if (!isValidAddress) {
      if (!provider && address.includes('.')) { // simple check if this might be an ENS address
        errorMsg = 'Connect wallet to validate';
      } else if (address.trim()) {
        errorMsg = 'Invalid address';
      }
    }
    updateTokenAllocation(index, {
      address: address,
      amount: tokenAllocation.amount,
      addressError: errorMsg,
    });
  };

  const updateAmount = (value: string) => {
    updateTokenAllocation(index, {
      address: tokenAllocation.address,
      amount: { value, bigNumberValue: utils.parseUnits(value || '0', DEFAULT_TOKEN_DECIMALS) },
      addressError: tokenAllocation.addressError,
    });
  };

  return (
    <>
      <Input
        containerClassName="col-start-1 col-span-4 md:col-span-5 w-full my-auto"
        type="text"
        value={tokenAllocation.address}
        onChange={event => updateAddress(event.target.value)}
        errorMessage={tokenAllocation.addressError ? tokenAllocation.addressError : hasAmountError ? '‎' : undefined}
      />
      <Input
        containerClassName="col-span-2 md:pt-0 my-auto"
        type="number"
        value={tokenAllocation.amount.value}
        onChange={event => updateAmount(event.target.value)}
        errorMessage={hasAmountError ? 'Allocated more than supply' : tokenAllocation.addressError ? '‎' : undefined}
        restrictChar={RestrictCharTypes.FLOAT_NUMBERS}
        decimals={DEFAULT_TOKEN_DECIMALS}
      />
      <div className="md:col-span-1">
        <TextButton
          type="button"
          onClick={() => removeTokenAllocation(index)}
          label="Remove"
          className="px-0 mx-0"
        />
      </div>
    </>
  );
}

export default TokenAllocationInput;
