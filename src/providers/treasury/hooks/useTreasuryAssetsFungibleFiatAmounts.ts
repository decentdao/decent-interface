import { utils } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import countDecimals from '../../../utils/countDecimals';
import {
  TreasuryAssetFungible,
  TreasuryAssetFungiblePrice,
  TreasuryAssetFungibleFiatAmounts,
  TreasuryAssetFungiblePrices,
} from '../types';
import { formatFiatAmount } from '../utils';

/**
 * generates an object of fiat amounts per fungible asset
 *
 * @param assets
 * @param prices
 * @returns TreasuryAssetFungibleFiatAmounts | {}
 */
const useTreasuryAssetsFungibleFiatAmounts = (
  assets: TreasuryAssetFungible[],
  prices: TreasuryAssetFungiblePrices,
  selectedCurrency: string
) => {
  const [amounts, setAmounts] = useState<TreasuryAssetFungibleFiatAmounts | {}>({});

  const calculateFiatAmount = useCallback(
    (price: TreasuryAssetFungiblePrice, asset: TreasuryAssetFungible) => {
      // this Number will usually come in as a float
      const { amount: priceAmount } = price[selectedCurrency];

      // BigNumber does not support floats, so a
      // multiplier is computed to perform the calculation.
      const decimals = countDecimals(priceAmount);
      const multiplier = Math.pow(10, decimals);

      // to get around undesireable precision issues with
      // JS math, priceAmount is stripped of its decimal to
      // generate the equivalent of (priceAmount * multiplier).
      const priceAmountTimesMultiplier = priceAmount.toString().split('.').join('');

      // perform the calculation, convert to the proper units,
      // and coerce it into a Number.
      const calculatedAmount = asset.totalAmount.mul(priceAmountTimesMultiplier).div(multiplier);
      const convertedFiatAmount = utils.formatUnits(calculatedAmount, asset.decimals);
      const fiatAmount = Number(convertedFiatAmount.toString());

      // viola.
      return fiatAmount;
    },
    [selectedCurrency]
  );

  useEffect(() => {
    const formattedFiatAmounts = Object.entries(prices).reduce((result, [address, price]) => {
      const asset = assets.find(({ contractAddress }) => address === contractAddress);
      if (!asset) return result;

      const fiatAmount = calculateFiatAmount(price, asset);
      const formattedFiatAmount = formatFiatAmount(selectedCurrency, fiatAmount);

      return { ...result, [address]: formattedFiatAmount };
    }, {});

    setAmounts(formattedFiatAmounts);
  }, [assets, calculateFiatAmount, prices, selectedCurrency]);

  return amounts;
};

export default useTreasuryAssetsFungibleFiatAmounts;
