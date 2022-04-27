import { useState } from "react";
import Button from "../../ui/Button";
import useDelegateVote from "../../../daoData/useDelegateVote";
import useDisplayName from "../../../hooks/useDisplayName";
import { InputAddress } from "../../ui/Input";
import ConnectModal from "../../ConnectModal";
import Pending from "../../Pending";
import { useWeb3 } from "../../../web3";
import { useDAOData } from "../../../daoData";

function DelegateVote() {
  const [newDelegatee, setNewDelegatee] = useState<string>("");
  const [pending, setPending] = useState<boolean>(false);
  const { account } = useWeb3();
  const [
    {
      tokenData: { symbol, userBalance, delegatee },
    },
  ] = useDAOData();
  const delegateeDisplayName = useDisplayName(delegatee);

  const delegateSelf = () => {
    if(account === undefined) {
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
      <ConnectModal />
      <div className="flex flex-col bg-gray-600 m-2 p-2 max-w-xs py-2 rounded-md">
        <div className="flex mx-2 my-1 text-gray-25">Delegate Vote</div>
        <hr className="mx-2 my-1 border-gray-200" />
        <Button onClick={() => delegateSelf()}>Self</Button>
        {/* <CreateDAOInput
          dataType="text"
          value={newDelegatee}
          onChange={(e) => setNewDelegatee(e)}
          label="Delegatee Address"
          helperText="The address to delegate your votes to"
          disabled={false}
        /> */}
          <InputAddress
            value={newDelegatee}
            disabled={false}
            placeholder={""}
            error={false}
            onChange={(e) => setNewDelegatee(e)}
          />
        )
        <div className="flex mx-2 my-1 text-gray-25">
          {`Balance: ${userBalance} ${symbol}`}
        </div>
        <div className="flex mx-2 my-1 text-gray-25">
          {`Delegatee: ${delegateeDisplayName}`}
        </div>
        <Button onClick={() => delegateVote()}>Delegate</Button>
      </div>
    </>
  );
}

export default DelegateVote;
