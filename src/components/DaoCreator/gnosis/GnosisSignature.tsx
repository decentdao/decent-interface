import { Grid, Button } from '@chakra-ui/react';
import { Input, LabelWrapper } from '@decent-org/fractal-ui';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import { checkAddress } from '../../../hooks/utils/useAddress';
import { useWeb3Provider } from '../../../providers/web3Data/hooks/useWeb3Provider';
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
    <Grid
      templateColumns="minmax(auto, 100%) minmax(auto, 1fr)"
      alignItems="center"
      my="1rem"
      data-testid={`gnosisConfig-signer-${index}`}
    >
      <LabelWrapper errorMessage={trustee.error ? t('errorInvalidAddress') : undefined}>
        <Input
          size="base"
          type="text"
          value={trustee.address}
          placeholder={ethers.constants.AddressZero}
          onChange={event => updateAndValidateAddress(event.target.value)}
          width="full"
        />
      </LabelWrapper>
      {trustedAddresses.length > 1 && (
        <Button
          variant="text"
          onClick={() => removeAddress(index)}
        >
          {t('remove')}
        </Button>
      )}
    </Grid>
  );
}
