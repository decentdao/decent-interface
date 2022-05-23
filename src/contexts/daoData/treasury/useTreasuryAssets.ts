import { BigNumber, utils } from "ethers";
import { useEffect, useMemo } from "react";
import { ERC20TokenEvent, TokenDepositEvent, TokenEvent, TreasuryAsset } from "./types";

/**
 * handles events to generate a list of assets count and amounts.
 *
 * @param nativeDeposits
 * @param nativeWithdrawals
 * @param erc20Deposits
 * @param erc20Withdrawals
 * @returns
 */
const useTreasuryAssets = (
  nativeDeposits?: TokenDepositEvent[],
  nativeWithdrawals?: TokenEvent[],
  erc20Deposits?: ERC20TokenEvent[],
  erc20Withdrawals?: ERC20TokenEvent[]
) => {
  const treasuryAssets = useMemo<Map<string, TreasuryAsset>>(() => new Map(), []);

  useEffect(() => {
    if (!nativeDeposits || !nativeDeposits.length || !nativeWithdrawals) {
      return;
    }
    let amount = BigNumber.from(0);
    nativeDeposits.forEach((event: TokenDepositEvent) => {
      amount = amount.add(event.amount);
    });

    nativeWithdrawals.forEach((event: TokenEvent) => {
      amount = amount.sub(event.amount);
    });
    
    treasuryAssets.set("0x", {
      name: "Ethereum",
      symbol: "ETH",
      decimals: "18",
      contractAddress: "0x",
      totalAmount: amount,
      formatedTotal: utils.formatUnits(amount, 18),
    });
    
  }, [nativeDeposits, nativeWithdrawals, treasuryAssets]);

  return Array.from(treasuryAssets.values());
};

export default useTreasuryAssets;
