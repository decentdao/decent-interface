import { useState } from 'react';
import StepController from './DisplayStepController';
import ConnectWalletToast from '../ConnectWalletToast';
import ContentBox from '../ui/ContentBox';
import H1 from '../ui/H1';
import useDeployDAO, { TokenAllocation } from '../../hooks/useDeployDAO';
import { TextButton, SecondaryButton, PrimaryButton } from '../ui/forms/Button';
import LeftArrow from '../ui/svg/LeftArrow';
import RightArrow from '../ui/svg/RightArrow';
import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

function DaoCreator() {
  const [step, setStep] = useState<number>(0);
  const [prevEnabled, setPrevEnabled] = useState<boolean>(false);
  const [nextEnabled, setNextEnabled] = useState<boolean>(false);
  const [deployEnabled, setDeployEnabled] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);
  const [daoName, setDAOName] = useState<string>('');
  const [tokenName, setTokenName] = useState<string>('');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [tokenSupply, setTokenSupply] = useState<string>('');
  const [tokenAllocations, setTokenAllocations] = useState<TokenAllocation[]>([
    { address: '', amount: 0 },
  ]);
  const [proposalThreshold, setProposalThreshold] = useState<string>('0');
  const [quorum, setQuorum] = useState<string>('4');
  const [executionDelay, setExecutionDelay] = useState<string>('6545');
  const [lateQuorumExecution, setLateQuorumExecution] = useState<string>('0');
  const [voteStartDelay, setVoteStartDelay] = useState<string>('6545');
  const [votingPeriod, setVotingPeriod] = useState<string>('45818');
  const {
    state: { account },
  } = useWeb3Provider();

  const decrement = () => {
    setStep(currPage => currPage - 1);
  };

  const increment = () => {
    setStep(currPage => currPage + 1);
  };

  const navigate = useNavigate();

  const successCallback = (daoAddress: ethers.utils.Result) => {
    setPending(false);
    setDAOName('');
    setTokenName('');
    setTokenSymbol('');
    setTokenSupply('');
    setTokenAllocations([]);
    setProposalThreshold('');
    setQuorum('');
    setExecutionDelay('');
    setLateQuorumExecution('');
    setVoteStartDelay('');
    setVotingPeriod('');

    navigate(`/daos/${daoAddress}`);
  };

  const deploy = useDeployDAO({
    daoName,
    tokenName,
    tokenSymbol,
    tokenSupply,
    tokenAllocations,
    proposalThreshold,
    quorum,
    executionDelay,
    lateQuorumExecution,
    voteStartDelay,
    votingPeriod,
    setPending,
    successCallback,
  });

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
              onClick={deploy}
              label="Deploy"
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
