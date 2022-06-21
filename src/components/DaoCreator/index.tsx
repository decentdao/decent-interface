import { useState } from 'react';
import StepController from './DisplayStepController';
import ConnectWalletToast from '../ConnectWalletToast';
import ContentBox from '../ui/ContentBox';
import H1 from '../ui/H1';
import { TokenAllocation } from '../../types/tokenAllocation';
import { TextButton, SecondaryButton, PrimaryButton } from '../ui/forms/Button';
import LeftArrow from '../ui/svg/LeftArrow';
import RightArrow from '../ui/svg/RightArrow';
import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';

function DaoCreator({
  pending,
  daoName,
  setDAOName,
  tokenName,
  setTokenName,
  tokenSymbol,
  setTokenSymbol,
  tokenSupply,
  setTokenSupply,
  tokenAllocations,
  setTokenAllocations,
  proposalThreshold,
  setProposalThreshold,
  quorum,
  setQuorum,
  executionDelay,
  setExecutionDelay,
  lateQuorumExecution,
  setLateQuorumExecution,
  voteStartDelay,
  setVoteStartDelay,
  votingPeriod,
  setVotingPeriod,
  nextLabel,
  nextTrigger,
}: {
  pending: boolean;
  daoName: string;
  setDAOName: React.Dispatch<React.SetStateAction<string>>;
  tokenName: string;
  setTokenName: React.Dispatch<React.SetStateAction<string>>;
  tokenSymbol: string;
  setTokenSymbol: React.Dispatch<React.SetStateAction<string>>;
  tokenSupply: string;
  setTokenSupply: React.Dispatch<React.SetStateAction<string>>;
  tokenAllocations: TokenAllocation[];
  setTokenAllocations: React.Dispatch<React.SetStateAction<TokenAllocation[]>>;
  proposalThreshold: string;
  setProposalThreshold: React.Dispatch<React.SetStateAction<string>>;
  quorum: string;
  setQuorum: React.Dispatch<React.SetStateAction<string>>;
  executionDelay: string;
  setExecutionDelay: React.Dispatch<React.SetStateAction<string>>;
  lateQuorumExecution: string;
  setLateQuorumExecution: React.Dispatch<React.SetStateAction<string>>;
  voteStartDelay: string;
  setVoteStartDelay: React.Dispatch<React.SetStateAction<string>>;
  votingPeriod: string;
  setVotingPeriod: React.Dispatch<React.SetStateAction<string>>;
  nextLabel: string;
  nextTrigger: () => void;
}) {
  const [step, setStep] = useState<number>(0);
  const [prevEnabled, setPrevEnabled] = useState<boolean>(false);
  const [nextEnabled, setNextEnabled] = useState<boolean>(false);
  const [deployEnabled, setDeployEnabled] = useState<boolean>(false);
  const {
    state: { account },
  } = useWeb3Provider();

  const decrement = () => {
    setStep(currPage => currPage - 1);
  };

  const increment = () => {
    setStep(currPage => currPage + 1);
  };

  return (
    <div className="pb-16">
      <ConnectWalletToast label="To deploy a new Fractal" />
      <div>
        <H1>
          {!daoName || daoName.trim() === '' || step === 0
            ? 'Configure New Fractal'
            : 'Configure ' + daoName}
        </H1>
        <ContentBox>
          <form onSubmit={e => e.preventDefault()}>
            <StepController
              step={step}
              setPrevEnabled={setPrevEnabled}
              setNextEnabled={setNextEnabled}
              setDeployEnabled={setDeployEnabled}
              daoName={daoName}
              setDAOName={setDAOName}
              tokenName={tokenName}
              setTokenName={setTokenName}
              tokenSymbol={tokenSymbol}
              setTokenSymbol={setTokenSymbol}
              tokenSupply={tokenSupply}
              setTokenSupply={setTokenSupply}
              tokenAllocations={tokenAllocations}
              setTokenAllocations={setTokenAllocations}
              proposalThreshold={proposalThreshold}
              setProposalThreshold={setProposalThreshold}
              quorum={quorum}
              setQuorum={setQuorum}
              executionDelay={executionDelay}
              setExecutionDelay={setExecutionDelay}
              lateQuorumExecution={lateQuorumExecution}
              setLateQuorumExecution={setLateQuorumExecution}
              voteStartDelay={voteStartDelay}
              setVoteStartDelay={setVoteStartDelay}
              votingPeriod={votingPeriod}
              setVotingPeriod={setVotingPeriod}
            />
          </form>
        </ContentBox>

        <div className="flex items-center justify-center py-4">
          {step > 0 && (
            <TextButton
              onClick={decrement}
              disabled={!prevEnabled || pending}
              icon={<LeftArrow />}
              label="Prev"
            />
          )}
          {step < 2 && (
            <SecondaryButton
              onClick={increment}
              disabled={!nextEnabled}
              isIconRight
              icon={<RightArrow />}
              label="Next"
            />
          )}
          {step > 1 && (
            <PrimaryButton
              onClick={nextTrigger}
              label={nextLabel}
              isLarge
              className="w-48"
              disabled={pending || !account || !deployEnabled}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DaoCreator;
