import { useEffect, useState } from 'react'
import DAODetails from './DAODetails';
import TokenDetails from './TokenDetails';
// import GovernanceDetails from './GovernanceDetails';
// import { useWeb3 } from '../../../web3';
// import { useNavigate } from 'react-router';
import Button from '../../ui/Button';
import ConnectModal from '../../ConnectModal';
// import DeployDAO from '../../transactions/DeployDAO';

const StepDisplay = ({
  step,
  setPrevEnabled,
  setNextEnabled,
  
  daoName,
  setDAOName,

  tokenName,
  setTokenName,
  tokenSymbol,
  setTokenSymbol,
  tokenSupply,
  setTokenSupply,
}: {
  step: number,
  setPrevEnabled: React.Dispatch<React.SetStateAction<boolean>>,
  setNextEnabled: React.Dispatch<React.SetStateAction<boolean>>,
  
  daoName: string | undefined,
  setDAOName: React.Dispatch<React.SetStateAction<string | undefined>>

  tokenName: string | undefined,
  setTokenName: React.Dispatch<React.SetStateAction<string | undefined>>,
  tokenSymbol: string | undefined,
  setTokenSymbol: React.Dispatch<React.SetStateAction<string | undefined>>,
  tokenSupply: number | undefined,
  setTokenSupply: React.Dispatch<React.SetStateAction<number | undefined>>,
}) => {
  if (step === 0) {
    return (
      <DAODetails
        setPrevEnabled={setPrevEnabled}
        setNextEnabled={setNextEnabled}
        name={daoName}
        setName={setDAOName}
      />
    );
  } else if (step === 1) {
    return (
      <TokenDetails
        setPrevEnabled={setPrevEnabled}
        setNextEnabled={setNextEnabled}
        name={tokenName}
        setName={setTokenName}
        symbol={tokenSymbol}
        setSymbol={setTokenSymbol}
        supply={tokenSupply}
        setSupply={setTokenSupply}
      />
    );
  }
  return <></>
  // } else if (step === 1) {
  //   return <TokenDetails formData={formData} setFormData={setFormData} />;
  // } else {
  //   return <GovernanceDetails formData={formData} setFormData={setFormData} />;
  // }
}

const New = () => {
  // const navigate = useNavigate();
  // const { signerOrProvider } = useWeb3();

  const [step, setStep] = useState(0);

  const [prevEnabled, setPrevEnabled] = useState(false);
  const [nextEnabled, setNextEnabled] = useState(false);

  const [daoName, setDAOName] = useState<string>();
  const [tokenName, setTokenName] = useState<string>();
  const [tokenSymbol, setTokenSymbol] = useState<string>();
  const [tokenSupply, setTokenSupply] = useState<number>();
  const [proposalThreshold, setProposalThreshold] = useState<number>(0);
  const [quorum, setQuorum] = useState<number>(4);
  const [executionDelay, setExecutionDelay] = useState<number>(24);

  const decrement = () => {
    setStep((currPage) => currPage - 1);
  }

  const increment = () => {
    setStep((currPage) => currPage + 1);
  }

  // Able to send transaction / checks for web3 connection - if not - it has a popup and asks for connection
  // todo: connect to real metafactory not dao creator
  // todo: move creat dao components to its own folder
  // todo: create Pending page during transction
  return (
    <div>
      <ConnectModal />
      <div className="mx-24">
        <div className="mt-24 text-xl">{!daoName || daoName.trim() === "" ? "New Fractal Configuration" : daoName + " - Configuration"}</div>
        <div className="mx-auto bg-slate-100 px-8 mt-4 mb-8 pt-8 pb-8 content-center">
          <form onSubmit={e => e.preventDefault()}>
            <StepDisplay
              step={step}
              setPrevEnabled={setPrevEnabled}
              setNextEnabled={setNextEnabled}
              
              daoName={daoName}
              setDAOName={setDAOName}

              tokenName={tokenName}
              setTokenName={setTokenName}
              tokenSymbol={tokenSymbol}
              setTokenSymbol={setTokenSymbol}
              tokenSupply={tokenSupply}
              setTokenSupply={setTokenSupply}
            />
          </form>
        </div>

        <div className="flex items-center justify-center">
          {step > 0 && (
            <Button
              onClick={decrement}
              disabled={!prevEnabled}
            >
              Prev
            </Button>
          )}
          {step < 2 && (
            <Button
              onClick={increment}
              disabled={!nextEnabled}
            >
              Next
            </Button>
          )}
          {step > 1 && (
            <Button onClick={() => {
              // DeployDAO(formData.daoName, formData.tokenName, formData.tokenSymbol, formData.tokenSupply, signerOrProvider, navigate)
            }}>
              Create DAO
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default New;