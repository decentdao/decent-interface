import { Flex, Image, Text, Icon } from '@chakra-ui/react';
import { CheckCircle } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Address, getAddress } from 'viem';
import { useFractal } from '../../../providers/App/AppProvider';
import { formatCoin, formatUSD } from '../../../utils';
import { DropdownMenu } from '../menus/DropdownMenu';

export function AssetSelector({ disabled }: { disabled?: boolean }) {
  const { t } = useTranslation(['roles', 'treasury', 'modals']);

  const {
    treasury: { assetsFungible },
  } = useFractal();

  const fungibleAssets = assetsFungible.filter(
    asset => parseFloat(asset.balance) > 0 && !asset.nativeToken,
  );

  const [selectedAsset, setSelectedAsset] = useState<{
    name: string;
    symbol: string;
    decimals: number;
    address: Address;
    logo: string;
  } | null>(null);

  const dropdownItems = fungibleAssets.map(asset => ({
    value: asset.tokenAddress,
    label: asset.symbol,
    icon: asset.logo ?? asset.thumbnail ?? '/images/coin-icon-default.svg',
    selected: selectedAsset?.address === asset.tokenAddress,
    assetData: {
      name: asset.name,
      balance: asset.balance,
      decimals: asset.decimals,
      usdValue: asset.usdValue,
      symbol: asset.symbol,
    },
  }));

  return (
    <DropdownMenu<{
      assetData: {
        name: string;
        symbol: string;
        decimals: number;
        balance: string;
        usdValue?: number;
      };
    }>
      items={dropdownItems}
      selectedItem={dropdownItems.find(item => item.selected)}
      onSelect={item => {
        const chosenAsset = fungibleAssets.find(
          asset => asset.tokenAddress === getAddress(item.value),
        );
        if (chosenAsset) {
          setSelectedAsset({
            ...chosenAsset,
            logo: chosenAsset.logo ?? '',
            address: chosenAsset.tokenAddress,
          });
        } else {
          setSelectedAsset(null);
        }
      }}
      title={t('titleAssets', { ns: 'treasury' })}
      isDisabled={disabled}
      selectPlaceholder={t('selectLabel', { ns: 'modals' })}
      emptyMessage={t('emptyRolesAssets', { ns: 'roles' })}
      renderItem={(item, isSelected) => {
        const { balance, decimals, usdValue, symbol } = item.assetData;
        const balanceText = formatCoin(balance, true, decimals, symbol, true);

        return (
          <>
            <Flex
              alignItems="center"
              gap="1rem"
            >
              <Image
                src={item.icon}
                fallbackSrc="/images/coin-icon-default.svg"
                boxSize="2rem"
              />
              <Flex flexDir="column">
                <Text
                  textStyle="labels-large"
                  color="white-0"
                >
                  {item.label}
                </Text>
                <Flex
                  alignItems="center"
                  gap={2}
                >
                  <Text
                    textStyle="body-large"
                    color="neutral-7"
                  >
                    {balanceText}
                  </Text>
                  {usdValue && (
                    <>
                      <Text
                        textStyle="body-large"
                        color="neutral-7"
                      >
                        {'•'}
                      </Text>
                      <Text
                        textStyle="body-large"
                        color="neutral-7"
                      >
                        {formatUSD(usdValue)}
                      </Text>
                    </>
                  )}
                </Flex>
              </Flex>
            </Flex>
            {isSelected && (
              <Icon
                as={CheckCircle}
                boxSize="1.5rem"
                color="lilac-0"
              />
            )}
          </>
        );
      }}
    />
  );
}
