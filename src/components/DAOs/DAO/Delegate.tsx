import { useEffect, useState } from "react";
import { utils } from "ethers";
import useDelegateVote from "../../../daoData/useDelegateVote";
import useDisplayName from "../../../hooks/useDisplayName";
import ContentBox from "../../ui/ContentBox";
import EtherscanLink from "../../ui/EtherscanLink";
import { useWeb3 } from "../../../web3";
import { useDAOData } from "../../../daoData";
import Input from "../../ui/forms/Input";
import { SecondaryButton } from "../../ui/forms/Button";
import InputBox from "../../ui/forms/InputBox";
import cx from "classnames";
import useAddress from "../../../hooks/useAddress";
import Label from "../../ui/Label";

function Delegate() {
  const [newDelegatee, setNewDelegatee] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [{ account }] = useWeb3();
  const [, validAddress] = useAddress(newDelegatee);
  const [
    {
      tokenData: { decimals, symbol, userBalance, delegatee, votingWeight },
    },
  ] = useDAOData();
  const delegateeDisplayName = useDisplayName(delegatee);

  const delegateSelf = () => {
    if (account === undefined) {
      return;
    }

    setNewDelegatee(account);
  };

  const [delegateVote, pending] = useDelegateVote({
    delegatee: newDelegatee,
    successCallback: () => setNewDelegatee(""),
  });

  const [readableBalance, setReadableBalance] = useState<string>();
  useEffect(() => {
    if (userBalance === undefined || decimals === undefined || symbol === undefined) {
      setReadableBalance(undefined);
      return;
    }

    setReadableBalance(`${utils.formatUnits(userBalance, decimals)} ${symbol}`);
  }, [decimals, userBalance, symbol]);

  const [readableVotingWeight, setReadableVotingWeight] = useState<string>();
  useEffect(() => {
    if (votingWeight === undefined || decimals === undefined || symbol === undefined) {
      setReadableVotingWeight(undefined);
      return;
    }

    setReadableVotingWeight(`${utils.formatUnits(votingWeight, decimals)} ${symbol}`);
  }, [decimals, votingWeight, symbol]);

  useEffect(() => {
    if (validAddress === false) {
      setErrorMessage("Invalid address");
    }
  }, [validAddress]);
  return (
    <>
      <div className="flex flex-col bg-gray-600 my-4 p-2 py-2 rounded-md">
        <ContentBox title="Delegate Vote">
          <InputBox>
            <div className="flex m-2 w-full items-center">
              <Input
                type="text"
                value={newDelegatee}
                disabled={false}
                label="New Delegate Address"
                errorMessage={errorMessage}
                onChange={(e) => setNewDelegatee(e.target.value)}
              />
              <SecondaryButton onClick={() => delegateSelf()} label="Self" className={cx("h-fit -mt-2 sm:mt-0")} />
            </div>
          </InputBox>
          <Label label="Balance:" isDataLoading={!readableBalance}>
            <span className="text-gray-25 ml-2">{readableBalance}</span>
          </Label>
          <Label label="Current Delegatee:" isDataLoading={!delegateeDisplayName}>
            <EtherscanLink address={delegatee}>
              <span className="text-gold-500 ml-2">{delegateeDisplayName}</span>
            </EtherscanLink>
          </Label>
          <Label label="Current Voting Weight:" isDataLoading={readableVotingWeight === undefined}>
            <span className="text-gray-25 ml-2">{readableVotingWeight}</span>
          </Label>

          <SecondaryButton disabled={!validAddress || newDelegatee.trim() === "" || pending} onClick={() => delegateVote()} label="Delegate" className="mt-4" />
        </ContentBox>
      </div>
    </>
  );
}

export default Delegate;
