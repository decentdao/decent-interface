import { useState } from "react";
import Button from "../../ui/Button";
import useDelegateVote from "../../../daoData/useDelegateVote";
import CreateDAOInput from "../../ui/CreateDAOInput";
import ConnectModal from "../../ConnectModal";
import Pending from "../../Pending";
import { useWeb3 } from "../../../web3";

function DelegateVote() {
  const [delegatee, setDelegatee] = useState<string>();
  const [pending, setPending] = useState<boolean>(false);
  const { account } = useWeb3();

  const delegateSelf = () => {
    setDelegatee(account);
  }

  const delegateVote = useDelegateVote({
    delegatee: delegatee,
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
        <CreateDAOInput
          dataType="text"
          value={delegatee}
          onChange={(e) => setDelegatee(e)}
          label="Delegatee Address"
          helperText="The address to delegate your votes to"
          disabled={false}
        />
        <Button onClick={() => delegateVote()}>Delegate</Button>
      </div>
    </>
  );
}

export default DelegateVote;
