import { useState } from "react";
import DAODetails from "./DAODetails";
import TokenDetails from "./TokenDetails";
import GovernanceDetails from "./GovernanceDetails";
import ConnectModal from "../../ConnectModal";
import Pending from "../../Pending";
import useDeployDAO from "../../../daoData/useDeployDAO";
import ContentBox from "../../ui/ContentBox";
import LeftArrow from "../../ui/svg/LeftArrow";
import RightArrow from "../../ui/svg/RightArrow";
import { TokenAllocation } from "../../../daoData/useDeployDAO";
import { SecondaryButton, TextButton, PrimaryButton } from "../../ui/forms/Button";
import H1 from "../../ui/H1";

interface StepDisplayProps {
  step: number;
  daoName: string;
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: string;
  tokenAllocations: TokenAllocation[];
  proposalThreshold?: number;
  quorum?: number;
  executionDelay?: number;
  setDAOName: React.Dispatch<React.SetStateAction<string>>;
  setTokenName: React.Dispatch<React.SetStateAction<string>>;
  setTokenSymbol: React.Dispatch<React.SetStateAction<string>>;
  setTokenSupply: React.Dispatch<React.SetStateAction<string>>;
  setTokenAllocations: React.Dispatch<React.SetStateAction<TokenAllocation[]>>;
  setPrevEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setNextEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const StepDisplay = ({
  step,
  daoName,
  tokenName,
  tokenSymbol,
  tokenSupply,
  tokenAllocations,
  proposalThreshold,
  quorum,
  executionDelay,
  setDAOName,
  setTokenName,
  setTokenSymbol,
  setTokenSupply,
  setTokenAllocations,
  setPrevEnabled,
  setNextEnabled,
}: StepDisplayProps) => {
  if (step === 0) {
    return <DAODetails setPrevEnabled={setPrevEnabled} setNextEnabled={setNextEnabled} name={daoName} setName={setDAOName} />;
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
        tokenAllocations={tokenAllocations}
        setTokenAllocations={setTokenAllocations}
      />
    );
  } else if (step === 2) {
    return <GovernanceDetails setPrevEnabled={setPrevEnabled} proposalThreshold={proposalThreshold} quorum={quorum} executionDelay={executionDelay} />;
  }
  return <></>;
};

const New = () => {
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

  const decrement = () => {
    setStep((currPage) => currPage - 1);
  };

  const increment = () => {
    setStep((currPage) => currPage + 1);
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
  });

  return (
    <div>
      <Pending message="Creating Fractal..." pending={pending} />
      <ConnectModal />
      <div>
        <H1>{!daoName || daoName.trim() === "" || step === 0 ? "Configure New Fractal" : "Configure " + daoName}</H1>
        <ContentBox>
          <form onSubmit={(e) => e.preventDefault()}>
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
              tokenAllocations={tokenAllocations}
              setTokenAllocations={setTokenAllocations}
              proposalThreshold={proposalThreshold}
              quorum={quorum}
              executionDelay={executionDelay}
            />
          </form>
        </ContentBox>

        <div className="flex items-center justify-center py-4">
          {step > 0 && <TextButton onClick={decrement} disabled={!prevEnabled} icon={<LeftArrow />} label="Prev" />}
          {step < 2 && <SecondaryButton onClick={increment} disabled={!nextEnabled} isIconRight icon={<RightArrow />} label="Next" />}
          {step > 1 && <PrimaryButton onClick={deploy} label="Deploy" disabled={!daoName || !tokenName || !tokenSymbol || !tokenSupply} />}
        </div>
      </div>
    </div>
  );
};

export default New;
