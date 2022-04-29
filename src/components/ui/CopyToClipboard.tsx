import Clipboard from "./svg/Clipboard";
import { toast } from 'react-toastify';

function CopyToClipboard({ textToCopy }: { textToCopy: string }) {
  const copyTextToClipboard = () => {
    toast("Copied to clipboard", {
      onOpen: () => navigator.clipboard.writeText(textToCopy),
      autoClose: 1000
    })
  }
  return (
    <div className="cursor-pointer mx-2 hover:text-stone-300" onClick={copyTextToClipboard}>
      <Clipboard />
    </div>
  );
}

export default CopyToClipboard;
