import { useEffect } from "react";
import { toast } from "react-toastify";
import { TextButton } from "../../ui/forms/Button";
import { useWeb3 } from "../../../web3";

const ToastContent = ({ label }: { label: string }) => {
  const [, connect] = useWeb3();
  return (
    <div className="flex flex-col items-center">
      <div>{label}</div>
      <TextButton label="Connect Wallet" onClick={connect} />
    </div>
  );
}

const ConnectWalletToast = ({ label }: { label: string }) => {
  const [{ account }] = useWeb3();
  useEffect(() => {
    if (account) {
      return;
    }

    const toastId = toast(<ToastContent label={label} />, {
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      progress: 1,
    });

    return () => toast.dismiss(toastId);
  }, [account, label]);

  return null;
};

export default ConnectWalletToast;

