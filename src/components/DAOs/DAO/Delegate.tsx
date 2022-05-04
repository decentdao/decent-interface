import { useState } from "react";
import useDelegateVote from "../../../daoData/useDelegateVote";
import useDisplayName from "../../../hooks/useDisplayName";
import ContentBox from "../../ui/ContentBox";
import EtherscanLink from "../../ui/EtherscanLink";
import Pending from "../../Pending";
import { useWeb3 } from "../../../web3";
import { useDAOData } from "../../../daoData";
import Input from "../../ui/forms/Input";
import { SecondaryButton } from "../../ui/forms/Button";
import InputBox from "../../ui/forms/InputBox";
import cx from "classnames";
import useAddress from "../../../hooks/useAddress";
import DataLoadingWrapper from "../../ui/loaders/DataLoadingWrapper";

function Delegate() {
  const [newDelegatee, setNewDelegatee] = useState<string>("");
  const [pending, setPending] = useState<boolean>(false);
  const [{ account }] = useWeb3();
  const [, validAddress] = useAddress(newDelegatee);
  const [
    {
      tokenData: { symbol, userBalance, delegatee },
    },
  ] = useDAOData();
  const delegateeDisplayName = useDisplayName(delegatee);

  const delegateSelf = () => {
    if (account === undefined) {
      return;
    }

    setNewDelegatee(account);
  };

  const delegateVote = useDelegateVote({
    delegatee: newDelegatee,
    setPending,
  });

  return (
    <>
      <Pending message="Delegating Vote..." pending={pending} />
      <div className="flex flex-col bg-gray-600 my-4 p-2 py-2 rounded-md">
        <ContentBox title="Delegate Vote">
          <InputBox>
            <div className="flex m-2 w-full items-center">
              <Input
                type="text"
                value={newDelegatee}
                disabled={false}
                label="New Delegate Address"
                errorMessage={!validAddress && newDelegatee.trim() !== "" ? "Invalid Address" : undefined}
                onChange={(e) => setNewDelegatee(e.target.value)}
              />
              <SecondaryButton onClick={() => delegateSelf()} label="Self" className={cx("h-fit -mt-2 sm:mt-0")} />
            </div>
          </InputBox>
          <div className="flex mx-2 my-1 text-gray-50">
            Balance:{" "}
            <span className="text-gray-25 ml-2">
              <DataLoadingWrapper isLoading={!userBalance || !symbol}>{`${userBalance} ${symbol}`}</DataLoadingWrapper>
            </span>
          </div>
          <div className="flex mx-2 my-1 text-gray-50">
            Current Delegatee:{" "}
            <EtherscanLink address={delegatee}>
              <DataLoadingWrapper isLoading={!delegateeDisplayName}>
                <span className="text-gold-500 ml-2">{delegateeDisplayName}</span>
              </DataLoadingWrapper>
            </EtherscanLink>
          </div>
          <SecondaryButton disabled={!validAddress || newDelegatee.trim() === ""} onClick={() => delegateVote()} label="Delegate" className="mt-4" />
        </ContentBox>
      </div>
    </>
  );
}

export default Delegate;
