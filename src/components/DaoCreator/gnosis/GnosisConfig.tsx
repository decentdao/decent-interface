import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContentBox from '../../ui/ContentBox';
import ContentBoxTitle from '../../ui/ContentBoxTitle';
import Input, { RestrictCharTypes } from '../../ui/forms/Input';
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

  const { t } = useTranslation('daoCreate');

  useEffect(() => {
    let error: string = '';
    if (Number(signatureThreshold) === 0) {
      error = t('errorLowSignerThreshold');
    }
    if (Number(signatureThreshold) > numberOfSigners) {
      error = t('errorHighSignerThreshold');
    }

    setThresholdError(error);
  }, [signatureThreshold, numberOfSigners, t]);

  return (
    <ContentBox>
      <ContentBoxTitle>{t('titleCreateGnosis')}</ContentBoxTitle>
      <InputBox>
        <Input
          type="text"
          value={numberOfSigners}
          onChange={handleSignersChanges}
          label={t('labelSigThreshold')}
          helperText={t('labelSigners')}
          restrictChar={RestrictCharTypes.WHOLE_NUMBERS_ONLY}
        />
      </InputBox>
      <InputBox>
        <Input
          type="number"
          value={signatureThreshold}
          onChange={event => updateThreshold(event.target.value)}
          errorMessage={thresholdError}
          label={t('helperSigners')}
          helperText={t('helperSigThreshold')}
          restrictChar={RestrictCharTypes.WHOLE_NUMBERS_ONLY}
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
