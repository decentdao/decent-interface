import { useState, useEffect } from "react";
import Button from "../../ui/Button";
import useDelegateVote from "../../../daoData/useDelegateVote";
import useDisplayName from "../../../hooks/useDisplayName";
import { InputAddress } from "../../ui/Input";
import ContentBox from "../../ui/ContentBox";
import EtherscanLink from "../../ui/EtherscanLink";
import ConnectModal from "../../ConnectModal";
import Pending from "../../Pending";
import { useWeb3 } from "../../../web3";
import { useDAOData } from "../../../daoData";
import { ethers } from "ethers";

function DelegateVote() {
  const [newDelegatee, setNewDelegatee] = useState<string>("");
  const [invalidAddress, setInvalidAddress] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);
  const { account } = useWeb3();
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

  useEffect(() => {
    if (newDelegatee !== "" && !ethers.utils.isAddress(newDelegatee)) {
      setInvalidAddress(true);
    } else {
      setInvalidAddress(false);
    }
  }, [newDelegatee]);

  return (
    <>
      <Pending message="Delegating Vote..." pending={pending} />
      <ConnectModal />
      <div className="flex flex-col bg-gray-600 my-4 p-2 py-2 rounded-md">
        <ContentBox title="Delegate Vote">
          <hr className="mx-2 my-1 border-gray-200" />
          <div className="flex mx-2 my-1 text-gray-50">
            New Delegate Address
          </div>
          <div className="flex flex-row m-2">
            <InputAddress
              value={newDelegatee}
              disabled={false}
              placeholder={""}
              error={invalidAddress}
              onChange={(e) => setNewDelegatee(e)}
            />
            <Button onClick={() => delegateSelf()} addedClassNames="mx-2 px-2">
              Self
            </Button>
          </div>
          <div className="flex mx-2 my-1 text-gray-50">
            {`Balance: ${userBalance} ${symbol}`}
          </div>
          <div className="flex mx-2 my-1 text-gray-50">
            Current Delegatee: &nbsp;
            <EtherscanLink address={delegatee}>
              <p className="text-gold-500">{delegateeDisplayName}</p>
            </EtherscanLink>
          </div>
          {invalidAddress && (
            <div className="flex mx-2 my-1 text-red">Invalid Address</div>
          )}
          <Button
            disabled={invalidAddress || newDelegatee === ""}
            onClick={() => delegateVote()}
            addedClassNames="m-2 px-4 py-1"
          >
            Delegate
          </Button>
        </ContentBox>
      </div>
    </>
  );
}

export default DelegateVote;
