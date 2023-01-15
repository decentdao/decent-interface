import { Grid, Button } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { isAddress } from 'ethers/lib/utils';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { isSameAddress } from '../../../utils/crypto';
import { EthAddressInput } from '../../ui/EthAddressInput';
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

  const { t } = useTranslation(['common', 'daoCreate']);

  const updateAndValidateAddress = useCallback(
    (address: string, isValidAddress: boolean, snapshotTrustedAddresses: TrustedAddress[]) => {
      let hasDuplicateAddresses = false;

      const updatedAddress = snapshotTrustedAddresses.map((trustedAddress, i, prev) => {
        const isDuplicate = i !== index && isSameAddress(trustedAddress.address, address.trim());

        const hasOtherDuplicates = prev.some(
          (prevAddr, dupIndex) =>
            index != dupIndex &&
            i !== dupIndex &&
            isSameAddress(prevAddr.address, trustedAddress.address)
        );

        if (isDuplicate) {
          hasDuplicateAddresses = true;
          isValidAddress = false;
        }

        const hasAddressError = isDuplicate || hasOtherDuplicates;
        return {
          ...trustedAddress,
          isValidAddress: hasAddressError || isAddress(trustedAddress.address),
          addressError: hasAddressError
            ? t('errorDuplicateAddress', { ns: 'daoCreate' })
            : undefined,
        };
      });

      const addressError = hasDuplicateAddresses
        ? t('errorDuplicateAddress', { ns: 'daoCreate' })
        : !isValidAddress && address.trim()
        ? t('errorInvalidAddress')
        : undefined;

      const updatedTrustee = { address: address, isValidAddress, addressError };

      updatedAddress[index] = updatedTrustee;
      updateAddresses(updatedAddress, index, isValidAddress);
    },
    [index, t, updateAddresses]
  );

  return (
    <Grid
      templateColumns="minmax(auto, 100%) minmax(auto, 1fr)"
      alignItems="center"
      my="1rem"
    >
      <LabelWrapper errorMessage={trustee.addressError}>
        <EthAddressInput
          value={trustee.address}
          data-testid={'gnosisConfig-signer-' + index}
          onAddress={function (address: string, isValid: boolean): void {
            updateAndValidateAddress(address, isValid, trustedAddresses);
          }}
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
