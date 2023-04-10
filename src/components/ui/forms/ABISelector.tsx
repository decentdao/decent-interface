import { Select, Text } from '@chakra-ui/react';
import axios from 'axios';
import { isAddress } from 'ethers/lib/utils';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNetworkConfg } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { LabelComponent } from './InputComponent';

interface IABISelector {
  contractAddress?: string;
  onFetchABI?: (success: boolean) => void;
  onChange: (value: string) => void;
}

export default function ABISelector({ contractAddress, onChange, onFetchABI }: IABISelector) {
  const [abi, setABI] = useState();
  const { etherscanAPIBaseUrl } = useNetworkConfg();
  const { t } = useTranslation('common');

  useEffect(() => {
    const loadABI = async () => {
      if (contractAddress && isAddress(contractAddress)) {
        try {
          const response = await axios.get(
            `${etherscanAPIBaseUrl}/api?module=contract&action=getabi&address=${contractAddress}&apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY}`
          );
          const responseData = response.data;
          console.log(responseData);

          if (responseData.status === '1') {
            setABI(JSON.parse(responseData.result));
            if (onFetchABI) {
              onFetchABI(true);
            }
          } else {
            if (onFetchABI) {
              onFetchABI(false);
            }
          }
        } catch (e) {
          console.error('Error fetching ABI for smart contract', e);
          if (onFetchABI) {
            onFetchABI(false);
          }
        }
      }
    };
    loadABI();
  }, [contractAddress, etherscanAPIBaseUrl, onFetchABI]);

  console.log(abi, 'ABI');

  return (
    <LabelComponent
      label={t('abi')}
      helper={t('abiSelectorHelper')}
      isRequired={false}
    >
      <Select
        placeholder={t('select')}
        variant="outline"
        bg="input.background"
        borderColor="black.200"
        borderWidth="1px"
        borderRadius="4px"
        color="white"
        onChange={e => onChange(e.target.value)}
        sx={{ '> option, > optgroup': { bg: 'input.background' } }}
      ></Select>
      <Text color="grayscale.500">{t('abiSelectorDescription')}</Text>
    </LabelComponent>
  );
}
