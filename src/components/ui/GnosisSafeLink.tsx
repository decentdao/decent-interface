import useGnosisSafeLink from '../../hooks/useGnosisSafeLink';

function GnosisSafeLink({
  address,
  children,
}: {
  address: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <a
      href={useGnosisSafeLink(address)}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

export default GnosisSafeLink;
