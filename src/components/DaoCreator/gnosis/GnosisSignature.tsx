import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { checkAddress } from '../../../hooks/useAddress';
import { TextButton } from '../../ui/forms/Button';
import Input from '../../ui/forms/Input';
import { useCreator } from '../provider/hooks/useCreator';
import { TrustedAddress } from '../provider/types';

interface IGnosisSignatures {
  trustee: TrustedAddress;
  index: number;
  updateAddresses: (addresses: TrustedAddress[], index: number, error: boolean) => void;
  removeAddress: (index: number) => void;
}

export function GnosisSignatures({
  trustee,
  index,
  updateAddresses,
  removeAddress,
}: IGnosisSignatures) {
  const {
    state: {
      gnosis: { trustedAddresses },
    },
  } = useCreator();

  const {
    state: { provider },
  } = useWeb3Provider();

  const updateAndValidateAddress = async (address: string) => {
    let isValidAddress = false;
    if (address.trim()) {
      isValidAddress = await checkAddress(provider, address);
    }
    const gnosisAddresses = [...trustedAddresses];
    gnosisAddresses[index] = { address: address, error: !isValidAddress };
    updateAddresses(gnosisAddresses, index, isValidAddress);
  };
  const { t } = useTranslation();

  return (
    <div className="flex items-center my-2">
      <Input
        type="text"
        value={trustee.address}
        placeholder={ethers.constants.AddressZero}
        onChange={event => updateAndValidateAddress(event.target.value)}
        errorMessage={trustee.error ? t('errorInvalidAddress') : undefined}
      />
      {trustedAddresses.length > 1 && (
        <TextButton
          type="button"
          onClick={() => removeAddress(index)}
          label={t('remove')}
          className="px-2"
        />
      )}
    </div>
  );
}
