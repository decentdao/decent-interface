import { TokenAllocation } from '../../hooks/useDeployDAO';
import { checkAddress } from '../../hooks/useAddress';
import { TextButton } from '../ui/forms/Button';
import Input from '../ui/forms/Input';
import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';

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
    updateTokenAllocation(index, {
      address: address,
      amount: tokenAllocation.amount,
      addressError: !isValidAddress && address.trim() ? 'Invalid address' : undefined,
    });
  };

  const updateAmount = (amount: string) => {
    updateTokenAllocation(index, {
      address: tokenAllocation.address,
      amount: Number(amount),
      addressError: tokenAllocation.addressError,
    });
  };

  return (
    <>
      <Input
        containerClassName="col-start-1 col-span-4 md:col-span-5 w-full"
        type="text"
        value={tokenAllocation.address || ''}
        onChange={event => updateAddress(event.target.value)}
        errorMessage={tokenAllocation.addressError}
      />
      <Input
        containerClassName="col-span-2 md:pt-0"
        type="number"
        value={tokenAllocation.amount || ''}
        onChange={event => updateAmount(event.target.value)}
        errorMessage={hasAmountError ? 'Allocated more than supply' : undefined}
        isWholeNumberOnly
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
