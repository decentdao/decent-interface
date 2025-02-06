import { getAddress } from 'viem';
import { DefiBalance, NFTBalance, TokenBalance } from '../../src/types/daoTreasury';
import { DefiResponse, NFTResponse, TokenResponse } from '../shared/moralisTypes';

export function transformTokenResponse(token: TokenResponse): TokenBalance {
  return {
    ...token,
    tokenAddress: getAddress(token.token_address),
    verifiedContract: token.verified_contract,
    balanceFormatted: token.balance_formatted,
    nativeToken: token.native_token,
    portfolioPercentage: token.portfolio_percentage,
    logo: token.logo,
    thumbnail: token.thumbnail,
    usdValue: token.usd_value,
    possibleSpam: token.possible_spam,
  };
}

export function transformNFTResponse(nft: NFTResponse): NFTBalance {
  return {
    ...nft,
    tokenAddress: getAddress(nft.token_address),
    tokenId: nft.token_id,
    possibleSpam: !!nft.possible_spam,
    media: nft.media,
    metadata: nft.metadata ? JSON.parse(nft.metadata) : undefined,
    tokenUri: nft.token_uri,
    name: nft.name || undefined,
    symbol: nft.symbol || undefined,
    amount: nft.amount ? parseInt(nft.amount) : undefined,
  };
}

export function transformDefiResponse(defi: DefiResponse): DefiBalance {
  return defi;
}
