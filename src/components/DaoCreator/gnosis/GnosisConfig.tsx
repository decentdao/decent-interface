import { useState } from 'react';
import ContentBox from '../../ui/ContentBox';
import ContentBoxTitle from '../../ui/ContentBoxTitle';
import { TextButton } from '../../ui/forms/Button';
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

  const fieldUpdate = (value: TrustedAddress[] | string, field: string) => {
    dispatch({
      type: CreatorProviderActions.UPDATE_GNOSIS_CONFIG,
      payload: {
        [field]: value,
      },
    });
  };

  const addAddress = () => {
    const gnosisAddresses = [...trustedAddresses];
    gnosisAddresses.push({ address: '', error: false });
    fieldUpdate(gnosisAddresses, 'trustedAddresses');
  };

  const removeAddress = (index: number) => {
    const gnosisAddresses = trustedAddresses.filter((_, i) => i !== index);
    fieldUpdate(gnosisAddresses, 'trustedAddresses');
  };

  const updateAddresses = (addresses: TrustedAddress[]) => {
    fieldUpdate(addresses, 'trustedAddresses');
  };

  const updateThreshold = (threshold: string) => {
    let error: string = '';
    if (Number(threshold) === 0) {
      error = 'Threshold must be greater than 0';
    }
    if (Number(threshold) > trustedAddresses.length) {
      error = 'Threshold is to high';
    }

    setThresholdError(error);
    fieldUpdate(threshold, 'signatureThreshold');
  };

  return (
    <ContentBox>
      <ContentBoxTitle>Mint a New Token</ContentBoxTitle>
      <InputBox>
        <Input
          type="number"
          value={signatureThreshold}
          onChange={event => updateThreshold(event.target.value)}
          errorMessage={thresholdError}
          label="Signature Threshold"
          helperText="How many signatures are needed to pass a proposal."
          isWholeNumberOnly
          min="1"
        />
      </InputBox>

      <ContentBoxTitle>Trusted Addresses</ContentBoxTitle>
      <div className="text-gray-50 text-xs font-medium my-4">
        In eu ex dolore anim anim ullamco sit mollit id velit ut. Ipsum laborum exercitation
        deserunt deserunt dolore laboris qui velit mollit. Tempor nostrud tempor cillum proident ex
        exercitation in ea dolore officia enim culpa.
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
        <TextButton
          onClick={addAddress}
          className="pl-1 my-1 mx-0"
          label="Add Address +"
        />
      </InputBox>
    </ContentBox>
  );
}
