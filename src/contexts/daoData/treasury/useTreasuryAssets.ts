import { BigNumber, utils } from "ethers";
import { useEffect, useState } from "react";
import { useWeb3 } from "../../web3Data";
import { ERC20TokenEvent, TokenDepositEvent, TokenWithdrawEvent, TreasuryAsset } from "./types";
import Web3Token from "./Web3Token";

/**
 * handles events to generate a list of assets count and amounts.
 *
 * @param nativeDeposits
 * @param nativeWithdraws
 * @param erc20Deposits
 * @param erc20Withdraws
 * @returns TreasuryAsset[]
 */
const useTreasuryAssets = (
  nativeDeposits?: TokenDepositEvent[],
  nativeWithdraws?: TokenWithdrawEvent[],
  erc20TokenDeposits?: ERC20TokenEvent[],
  erc20TokenWithdraws?: ERC20TokenEvent[]
) => {
  // <Map<string, TreasuryAsset>>
  const [treasuryAssets] = useState<Map<string, TreasuryAsset>>(new Map());

  const [{ provider }] = useWeb3();

  /**
   * calculates native coin total amounts
   */
  useEffect(() => {
    if (!nativeDeposits || !nativeDeposits.length || !nativeWithdraws) {
      treasuryAssets.clear()
      return;
    }
    let amount = BigNumber.from(0);
    nativeDeposits.forEach((event: TokenDepositEvent) => {
      amount = amount.add(event.amount);
    });

    nativeWithdraws.forEach((event: TokenWithdrawEvent) => {
      amount = amount.sub(event.amount);
    });

    // native coins are set to "0x" key,
    // @todo update to allow for any native tokens
    treasuryAssets.set("0x", {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      contractAddress: "",
      totalAmount: amount,
      formatedTotal: utils.formatUnits(amount, 18),
    });
  }, [nativeDeposits, nativeWithdraws, treasuryAssets]);

  /**
   * calculates erc20 token total amounts
   */
  useEffect(() => {
    if (!erc20TokenDeposits || !erc20TokenDeposits.length || !erc20TokenWithdraws || !provider) {
      return;
    }

    const tokens = new Map<string, { tokenData: Web3Token; amount: BigNumber }>();

    // initlizes Web3Token class for each token
    // for each event sets the addresses to tokens Map
    // sums token amounts together for same token
    erc20TokenDeposits.forEach((event: ERC20TokenEvent) => {
      event.contractAddresses.forEach((contractAddress, i) => {
        const token = tokens.get(contractAddress);
        if (!token) {
          tokens.set(contractAddress, {
            tokenData: new Web3Token(contractAddress, provider),
            amount: event.amounts[i],
          });
        }
        if (token) {
          tokens.set(contractAddress, {
            tokenData: token.tokenData,
            amount: token.amount.add(event.amounts[i]),
          });
        }
      });
    });

    // subtracts token amounts together for same token
    erc20TokenWithdraws.forEach((event: ERC20TokenEvent) => {
      event.contractAddresses.forEach((contractAddress, i) => {
        const token = tokens.get(contractAddress);
        if (token) {
          tokens.set(contractAddress, {
            tokenData: token.tokenData,
            amount: token.amount.sub(event.amounts[i]),
          });
        }
      });
    });

    // promise using then web3Token class methods to retrive token data from blockchain.
    Promise.all(
      Array.from(tokens.values()).map(async (token) => {
        const name = await token.tokenData.name();
        const symbol = await token.tokenData.symbol();
        const decimals = await token.tokenData.decimals();
        const tokenAddress = token.tokenData.tokenAddress;
        treasuryAssets.set(tokenAddress, {
          name: name,
          symbol: symbol,
          decimals: decimals,
          contractAddress: tokenAddress,
          totalAmount: token.amount,
          formatedTotal: utils.formatUnits(token.amount, decimals),
        });
      })
    );
  }, [erc20TokenDeposits, erc20TokenWithdraws, provider, treasuryAssets]);

  return Array.from(treasuryAssets.values());
};

export default useTreasuryAssets;
