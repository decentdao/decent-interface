import { getStore } from '@netlify/blobs';
import SafeApiKit, { TransferListResponse } from '@safe-global/api-kit';
import uniqBy from 'lodash.uniqby';
import type { Address, Chain } from 'viem';
import {
  isAddress,
  getAddress,
  createPublicClient,
  http,
  getContract,
  erc20Abi,
  zeroAddress,
} from 'viem';
import { base, baseSepolia, mainnet, optimism, polygon, sepolia } from 'viem/chains';
import { TokenBalance } from '../../src/types';

const SUPPORTED_NETWORKS = [
  mainnet.id,
  polygon.id,
  base.id,
  baseSepolia.id,
  optimism.id,
  sepolia.id,
] as const;

type SupportedNetworks = (typeof SUPPORTED_NETWORKS)[number];

const getPublicClient = (chainId: SupportedNetworks) => {
  let chain: Chain;
  switch (chainId) {
    case mainnet.id:
      chain = mainnet;
      break;
    case polygon.id:
      chain = polygon;
      break;
    case base.id:
      chain = base;
      break;
    case baseSepolia.id:
      chain = baseSepolia;
      break;
    case optimism.id:
      chain = optimism;
      break;
    case sepolia.id:
      chain = sepolia;
      break;
    default:
      throw new Error('Unsupported chain');
  }
  return createPublicClient({
    chain,
    transport: http(),
    batch: {
      multicall: true,
    },
  });
};

type TokenBalances = {
  data: {
    assetsFungible: TokenBalance[];
    assetsNonFungible: any[]; // @todo - better type this
  };
  metadata: {
    fetched: number;
    lastTxHash: string;
  };
};

export default async function getTokenBalances(request: Request) {
  if (!process.env.TOKEN_BALANCES_CACHE_INTERVAL_MINUTES) {
    console.error('TOKEN_BALANCES_CACHE_INTERVAL_MINUTES is not set');
    return Response.json({ error: 'Error while fetching tokens balances' }, { status: 503 });
  }

  const requestSearchParams = new URL(request.url).searchParams;
  const addressParam = requestSearchParams.get('address');

  if (!addressParam || !isAddress(addressParam)) {
    return Response.json(
      { error: 'Address param was not provided or is not a valid address' },
      { status: 400 },
    );
  }

  const networkParam = requestSearchParams.get('network');
  if (!networkParam || !SUPPORTED_NETWORKS.includes(parseInt(networkParam) as SupportedNetworks)) {
    return Response.json({ error: 'Requested network is not supported' }, { status: 400 });
  }

  const store = getStore('token-balances');
  const nowSeconds = Math.floor(Date.now() / 1000);
  const cacheTimeSeconds = parseInt(process.env.TOKEN_BALANCES_CACHE_INTERVAL_MINUTES) * 60;
  const config = { store, nowSeconds, cacheTimeSeconds };

  const storeKey = `${networkParam}/${addressParam}`;

  const balances = await (store.getWithMetadata(storeKey, {
    type: 'json',
  }) as Promise<TokenBalances> | null);

  if (
    balances?.metadata.fetched &&
    balances.metadata.lastTxHash &&
    balances.metadata.fetched + config.cacheTimeSeconds > config.nowSeconds
  ) {
    return Response.json({ data: balances.data });
  } else {
    const chainId = parseInt(networkParam) as SupportedNetworks;
    const safeApiKit = new (SafeApiKit as any).default({ chainId: BigInt(chainId) });
    const safeTransfersResponse = await safeApiKit.getIncomingTransactions(addressParam);
    let allIncomingTransactions: TransferListResponse['results'] = [
      ...safeTransfersResponse.results,
    ];
    if (allIncomingTransactions.length) {
      const lastTransactionHash = allIncomingTransactions[0].transactionHash;
      if (balances && balances.metadata.lastTxHash === lastTransactionHash) {
        // @dev - there were no new transactions since last querying - no reason to re-fetch balances
        return Response.json({ data: balances.data });
      } else {
        let nextChunkUrl = safeTransfersResponse.next;
        try {
          while (nextChunkUrl) {
            const nextChunkResponse = await fetch(nextChunkUrl);
            const nextChunkResponseData = (await nextChunkResponse.json()) as TransferListResponse;
            allIncomingTransactions = [
              ...allIncomingTransactions,
              ...nextChunkResponseData.results,
            ];
            nextChunkUrl = nextChunkResponseData.next;
          }
          const assetsFungibleTransfers = uniqBy(
            allIncomingTransactions.filter(
              transfer =>
                transfer.type === 'ERC20_TRANSFER' &&
                !!transfer.tokenAddress &&
                isAddress(transfer.tokenAddress),
            ),
            'tokenAddress',
          );
          const publicClient = getPublicClient(chainId);
          const erc20Data = await Promise.all(
            assetsFungibleTransfers.map(async transfer => {
              const contract = getContract({
                address: getAddress(transfer.tokenAddress!), // We already filtered out transfers where tokenAddress is not present, though TypeScript is not picking that up
                client: publicClient,
                abi: erc20Abi,
              });
              const [balance, symbol, name, decimals] = await Promise.all([
                contract.read.balanceOf([addressParam]),
                contract.read.symbol(),
                contract.read.name(),
                contract.read.decimals(),
              ]);
              return { balance: String(balance), symbol, name, decimals };
            }),
          );
          const assetsFungible: TokenBalance[] = assetsFungibleTransfers.map((transfer, i) => {
            const { balance, symbol, name, decimals } = erc20Data[i];
            // @dev - we could probably rely on transfer.tokenInfo, though it's not typed
            // But it seems like it's not guaranteed to be in the response, and sometimes Safe API wrecks this info - so fetching that on-chain seems safer bet
            return {
              tokenAddress: transfer.tokenAddress! as Address,
              balance,
              symbol,
              name,
              decimals,
            };
          });

          const nativeTransfer = allIncomingTransactions.find(
            transfer => transfer.type === 'ETHER_TRANSFER',
          );

          if (nativeTransfer) {
            const nativeBalance = await publicClient.getBalance({ address: addressParam });
            assetsFungible.push({
              tokenAddress: zeroAddress,
              balance: nativeBalance.toString(),
              symbol: publicClient.chain.nativeCurrency.symbol,
              name: publicClient.chain.nativeCurrency.name,
              decimals: publicClient.chain.nativeCurrency.decimals,
            });
          }

          // @todo - derive assetsNonFungible from transfers
          const assetsNonFungible: any[] = [];

          const responseBody = { assetsFungible, assetsNonFungible };
          await store.setJSON(storeKey, responseBody, {
            metadata: { fetched: config.nowSeconds, lastTxHash: lastTransactionHash },
          });
          return Response.json({ data: responseBody });
        } catch (e) {
          console.error('Error while retrieving tokens balances');
          return Response.json({
            data: { assetsFungible: [], assetsNonFungible: [] },
            error: 'Error',
          });
        }
      }
    } else {
      return Response.json({ data: { assetsFungible: [], assetsNonFungible: [] } });
    }
  }
}
