import Clipboard from './svg/Clipboard';

function CopyToClipboard({ textToCopy }: {
  textToCopy: string,
}) {

  return (
    <div className="cursor-pointer mx-2" onClick={() => navigator.clipboard.writeText(textToCopy)}>
      <Clipboard />
    </div>
  );
}

export default CopyToClipboard;