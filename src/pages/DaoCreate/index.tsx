import { useState } from "react";
import ButtonStepController from "../../components/DaoCreate/ButtonStepController";
import StepController from "../../components/DaoCreate/DisplayStepController";
import ConnectWalletToast from "../../components/DAOs/shared/ConnectWalletToast";
import ContentBox from "../../components/ui/ContentBox";
import H1 from "../../components/ui/H1";
import { useWeb3 } from "../../contexts/web3Data";
import useDeployDAO, { TokenAllocation } from "../../hooks/useDeployDAO";

const DaoCreate = () => {
  const [step, setStep] = useState<number>(0);
  const [prevEnabled, setPrevEnabled] = useState<boolean>(false);
  const [nextEnabled, setNextEnabled] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);
  const [daoName, setDAOName] = useState<string>("");
  const [tokenName, setTokenName] = useState<string>("");
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [tokenSupply, setTokenSupply] = useState<string>("");
  const [tokenAllocations, setTokenAllocations] = useState<TokenAllocation[]>([{ address: "", amount: 0 }]);
  const [proposalThreshold] = useState<number>(0);
  const [quorum] = useState<number>(4);
  const [executionDelay] = useState<number>(24);
  const [{ account }] = useWeb3();

  const decrement = () => {
    setStep((currPage) => currPage - 1);
  };

  const increment = () => {
    setStep((currPage) => currPage + 1);
  };

  const clearState = () => {
    setPending(false);
    setDAOName("");
    setTokenName("");
    setTokenSymbol("");
    setTokenSupply("");
    setTokenAllocations([]);
  };

  const deploy = useDeployDAO({
    daoName,
    tokenName,
    tokenSymbol,
    tokenSupply: Number(tokenSupply),
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
        <H1>{!daoName || daoName.trim() === "" || step === 0 ? "Configure New Fractal" : "Configure " + daoName}</H1>
        <ContentBox>
          <form onSubmit={(e) => e.preventDefault()}>
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
              quorum={quorum}
              executionDelay={executionDelay}
            />
          </form>
        </ContentBox>

        <div className="flex items-center justify-center py-4">
          <ButtonStepController
            step={step}
            decrement={decrement}
            increment={increment}
            isPrevEnabled={prevEnabled}
            isNextEnabled={nextEnabled}
            isPrimaryDisabled={!daoName || !tokenName || !tokenSymbol || !tokenSupply || pending || !account}
            deploy={deploy}
          />
        </div>
      </div>
    </div>
  );
};

export default DaoCreate;
