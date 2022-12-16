import { Grid, Button, Input } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { ethers } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { useTranslation } from 'react-i18next';
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

  const updateAndValidateAddress = (address: string) => {
    let isValidAddress = false;
    if (address.trim()) {
      isValidAddress = isAddress(address);
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
          value={trustee.address}
          placeholder={ethers.constants.AddressZero}
          onChange={event => updateAndValidateAddress(event.target.value)}
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
