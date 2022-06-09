import { useState } from 'react';
import StepController from '../../components/DaoCreate/DisplayStepController';
import ConnectWalletToast from '../../components/ConnectWalletToast';
import ContentBox from '../../components/ui/ContentBox';
import H1 from '../../components/ui/H1';
import { useWeb3 } from '../../contexts/web3Data';
import useDeployDAO, { TokenAllocation } from '../../hooks/useDeployDAO';
import { TextButton, SecondaryButton, PrimaryButton } from '../../components/ui/forms/Button';
import LeftArrow from '../../components/ui/svg/LeftArrow';
import RightArrow from '../../components/ui/svg/RightArrow';

function DaoCreate() {
  const [step, setStep] = useState<number>(0);
  const [prevEnabled, setPrevEnabled] = useState<boolean>(false);
  const [nextEnabled, setNextEnabled] = useState<boolean>(false);
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
  const [{ account }] = useWeb3();

  const decrement = () => {
    setStep(currPage => currPage - 1);
  };

  const increment = () => {
    setStep(currPage => currPage + 1);
  };

  const clearState = () => {
    setPending(false);
    setDAOName('');
    setTokenName('');
    setTokenSymbol('');
    setTokenSupply('');
    setTokenAllocations([]);
    setProposalThreshold('');
    setQuorum('');
    setExecutionDelay('');
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
    setPending,
    clearState,
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
              disabled={
                !daoName || !tokenName || !tokenSymbol || !tokenSupply || pending || !account
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DaoCreate;
