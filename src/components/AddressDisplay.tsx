import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useDAOContract from '../hooks/useDAOContract';
import useDAOName from '../hooks/useDAOName';
import CopyToClipboard from './ui/CopyToClipboard';
import EtherscanLinkAddress from './ui/EtherscanLinkAddress';
import { TextButton } from './ui/forms/Button';
import InputBox from './ui/forms/InputBox';

interface AddressDisplayProps {
  address?: string;
  label: string | Promise<string>;
}

export function AddressDisplay({ address, label }: AddressDisplayProps) {
  const [lbl, setLbl] = useState('');
  useEffect(() => {
    Promise.resolve(label).then(setLbl);
  }, [label]);

  return (
    <div>
      <div className="text-sm font-medium text-gray-50 pb-1">{lbl}</div>
      <div className="flex items-center">
        <EtherscanLinkAddress address={address}>
          <div className="text-gold-500 hover:text-gold-300 font-semibold tracking-wider font-mono break-all">
            {address}
          </div>
        </EtherscanLinkAddress>
        <CopyToClipboard textToCopy={address} />
      </div>
    </div>
  );
}

export function DAOAddress({ daoAddress }: { daoAddress: string }) {
  const daoContract = useDAOContract(daoAddress);
  const name = useDAOName(daoContract);
  return (
    <InputBox>
      <div className="flex justify-between items-center">
        <AddressDisplay
          address={daoAddress}
          label={name!}
        />
        <Link to={`/daos/${daoAddress}`}>
          <TextButton label="View DAO" />
        </Link>
      </div>
    </InputBox>
  );
}
