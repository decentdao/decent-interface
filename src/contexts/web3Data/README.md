# Decent Wallet Provider

Using ![Web3 Modal](https://web3modal.com) to connect Ethereum or EVM supported wallets.

## Supported Wallets

### Injected Wallets
Metamask, Frame etc
### WalletConnect
Using WalletConnect Provider, allows connection to mobile and supported desktop apps

## Getting Started
`Web3Provider.tsx` exports a component that excepts children as an argument and wraps with `<context.Provider value={contextValue}>{children}</context.Provider>`. (recommended `index.tsx` in root of project)

```tsx
ReactDOM.render(
  <Web3Provider>
    <App />
  </Web3Provider>
);
```

using the `useWeb3Provider()` hook in `hooks/useWeb3Provider.ts` you now have access to the Wallet Provider and connection information within state. For Typed Definition see `types.ts`

```ts
export interface IWeb3ProviderContext {
  state: InitialState;
  connect: ConnectFn;
  disconnect: DisconnectFn;
}
```

## Usage

```tsx
function Component() {
  const { state: { account, chaindId, network, connectionType } } = useWeb3Provider();

  console.log(account)
  // if connected 0x.... 
  // if not connected null
  console.log(chainId)
  // 0x04
  console.log(network)
  // 'rinkeby'
  console.log(connectionType)
  // 'injected provider'
  ... 
}
```

### Connecting and Disconnect to Wallet

```tsx
function Component() {
  const { state: { account },  connect, disconnect } = useWeb3Provider();

  if(!account) {
    return (
      <button onClick={connect}>Connect</button>
    )
    return (
      <button onClick={disconnect}>Disconnect</button>
    )
  }
}
```

### Interacting with the blockchain

```tsx
function Component() {
  const { state: { provider, signer } } = useWeb3Provider();

  // When retreiving information use provider
    provider.on('block',  (block: number) => {
      setBlockNumber(block);
    };);

  // When broadcasting a transaction or interacting with a contract use Signer
  ontract.connect(daoData.moduleAddresses[1], signer);
}
```


