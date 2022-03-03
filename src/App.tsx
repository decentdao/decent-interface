import { useWeb3 } from './web3';
import { connect } from './web3/providers';
import useDisplayName from './hooks/useDisplayName';

function App() {
  const { account } = useWeb3();
  const accountDisplayName = useDisplayName(account);

  return (
    <div className="container my-2">
      <header>
        <p>
          Interface
        </p>
        <div>
          {!account && (
            <button onClick={connect}>
              connect wallet
            </button>
          )}
          {account && (
            <div>
              <div>{accountDisplayName}</div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
