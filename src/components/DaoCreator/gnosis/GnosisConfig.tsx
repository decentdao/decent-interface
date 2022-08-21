import { ChangeEvent, useEffect, useState } from 'react';
import ContentBox from '../../ui/ContentBox';
import ContentBoxTitle from '../../ui/ContentBoxTitle';
import Input from '../../ui/forms/Input';
import InputBox from '../../ui/forms/InputBox';
import { useCreator } from '../provider/hooks/useCreator';
import { CreatorProviderActions, TrustedAddress } from '../provider/types';
import { GnosisSignatures } from './GnosisSignature';

export function GnosisConfig() {
  const {
    state: {
      gnosis: { trustedAddresses, signatureThreshold },
    },
    dispatch,
  } = useCreator();
  const [thresholdError, setThresholdError] = useState('');
  const [numberOfSigners, setNumberOfSigners] = useState<number>(trustedAddresses.length);

  const fieldUpdate = (value: TrustedAddress[] | string, field: string) => {
    dispatch({
      type: CreatorProviderActions.UPDATE_GNOSIS_CONFIG,
      payload: {
        [field]: value,
      },
    });
  };

  const handleSignersChanges = (event: ChangeEvent<HTMLInputElement>) => {
    let numOfSigners = Number(event.target.value);
    if (trustedAddresses.length !== numOfSigners) {
      const gnosisAddresses = [...trustedAddresses];
      const trustedAddressLength = trustedAddresses.length;
      if (numOfSigners > trustedAddressLength) {
        const difference = numOfSigners - trustedAddressLength;
        gnosisAddresses.push(...new Array(difference).fill({ address: '', error: false }));
      }
      if (numOfSigners < trustedAddressLength) {
        const difference = trustedAddressLength - numOfSigners;
        gnosisAddresses.splice(trustedAddressLength - difference, difference + 1);
      }
      fieldUpdate(gnosisAddresses, 'trustedAddresses');
    }
    setNumberOfSigners(numOfSigners);
  };

  const removeAddress = (index: number) => {
    const gnosisAddresses = trustedAddresses.filter((_, i) => i !== index);
    setNumberOfSigners(gnosisAddresses.length);
    fieldUpdate(gnosisAddresses, 'trustedAddresses');
  };

  const updateAddresses = (addresses: TrustedAddress[]) => {
    fieldUpdate(addresses, 'trustedAddresses');
  };

  const updateThreshold = (threshold: string) => {
    fieldUpdate(threshold, 'signatureThreshold');
  };

  useEffect(() => {
    let error: string = '';
    if (Number(signatureThreshold) === 0) {
      error = 'Threshold must be greater than 0';
    }
    if (Number(signatureThreshold) > numberOfSigners) {
      error = 'Threshold is to high';
    }

    setThresholdError(error);
  }, [signatureThreshold, numberOfSigners]);

  return (
    <ContentBox>
      <ContentBoxTitle>Mint a New Token</ContentBoxTitle>
      <InputBox>
        <Input
          type="text"
          value={numberOfSigners}
          onChange={handleSignersChanges}
          label="Signers"
          helperText="How many trusted users for Gnosis Safe"
          isWholeNumberOnly
        />
      </InputBox>
      <InputBox>
        <Input
          type="number"
          value={signatureThreshold}
          onChange={event => updateThreshold(event.target.value)}
          errorMessage={thresholdError}
          label="Signature Threshold"
          helperText="How many signatures are needed to pass a proposal."
          isWholeNumberOnly
        />
      </InputBox>

      <ContentBoxTitle>Trusted Addresses</ContentBoxTitle>
      <div className="text-gray-50 text-xs font-medium my-4">
        The addresses added here have permission to submit and approve transactions
      </div>
      <InputBox>
        {trustedAddresses.map((trustee, i) => (
          <GnosisSignatures
            key={i}
            trustee={trustee}
            index={i}
            updateAddresses={updateAddresses}
            removeAddress={removeAddress}
          />
        ))}
      </InputBox>
    </ContentBox>
  );
}
