import useAddress from '../../hooks/useAddress';
import useENSName from '../../hooks/useENSName';
import useSubDomain from '../../hooks/useSubDomain';
import { createAccountSubstring } from '../../hooks/useDisplayName';

function EtherscanLinkAddress({
  address,
  children,
  showENSName,
}: {
  address: string | undefined;
  children?: React.ReactNode;
  showENSName?: boolean;
}) {
  const subdomain = useSubDomain();
  const [validatedAddress] = useAddress(address);
  const ensName = useENSName(validatedAddress);

  if (!address) {
    return null;
  }

  return (
    <a
      href={`https://${subdomain}etherscan.io/address/${address}`}
      target="_blank"
      rel="noreferrer"
    >
      {showENSName ? ensName || createAccountSubstring(validatedAddress || address) : children}
    </a>
  );
}

export default EtherscanLinkAddress;
