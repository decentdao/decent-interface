import { useState } from 'react'
import DAODetails from './DAODetails';
import TokenDetails from './TokenDetails';
import GovernanceDetails from './GovernanceDetails';
import Button from '../../ui/Button';
import ConnectModal from '../../ConnectModal';
import Pending from '../../Pending';
import useDeployDAO from '../../../daoData/useDeployDAO';
import ContentBox from '../../ui/ContentBox';

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
  proposalThreshold,
  quorum,
  executionDelay,
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
  proposalThreshold: number | undefined,
  quorum: number | undefined,
  executionDelay: number | undefined,
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
  } else if (step === 2) {
    return (
      <GovernanceDetails
        setPrevEnabled={setPrevEnabled}
        proposalThreshold={proposalThreshold}
        quorum={quorum}
        executionDelay={executionDelay}
      />
    );
  }
  return <></>
}

const New = () => {
  const [step, setStep] = useState<number>(0);
  const [prevEnabled, setPrevEnabled] = useState<boolean>(false);
  const [nextEnabled, setNextEnabled] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);


  const [daoName, setDAOName] = useState<string>();
  const [tokenName, setTokenName] = useState<string>();
  const [tokenSymbol, setTokenSymbol] = useState<string>();
  const [tokenSupply, setTokenSupply] = useState<number>();
  const [proposalThreshold] = useState<number>(0);
  const [quorum] = useState<number>(4);
  const [executionDelay] = useState<number>(24);

  const decrement = () => {
    setStep((currPage) => currPage - 1);
  }

  const increment = () => {
    setStep((currPage) => currPage + 1);
  }

  const deploy = useDeployDAO(
    {
      daoName,
      tokenName,
      tokenSymbol,
      tokenSupply,
      proposalThreshold,
      quorum,
      executionDelay,
      setPending
    }
  )
  return (
    <div>
      <Pending
        pending={pending}
      />
      <ConnectModal />
      <div>
        <div className="text-2xl capitalize text-white">{!daoName || daoName.trim() === "" ? "Configure - New Fractal" : "Configure - " + daoName}</div>
        <ContentBox>
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
              proposalThreshold={proposalThreshold}
              quorum={quorum}
              executionDelay={executionDelay}
            />
          </form>
        </ContentBox>

        <div className="flex items-center justify-center">
          {step > 0 && (
            <Button
              onClick={decrement}
              disabled={!prevEnabled}
            >
              <div className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-6 pr-1 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <div >Prev</div>
              </div>
            </Button>
          )}
          {step < 2 && (
            <Button
              onClick={increment}
              disabled={!nextEnabled}
            >
              <div className="flex">
                <div >Next</div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-6 pl-1 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Button>
          )}
          {step > 1 && (
            <Button onClick={() => {
              if (!daoName || !tokenName || !tokenSymbol || !tokenSupply) { return }
              deploy();
            }
            }>
              Create DAO
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default New;