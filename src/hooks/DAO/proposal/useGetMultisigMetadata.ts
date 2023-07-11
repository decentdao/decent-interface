import { utils } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
import {
  ActivityTransactionType,
  ProposalMetadata,
  SafeMultisigTransactionResponse,
} from '../../../types';
import { CacheKeys } from '../../utils/cache/cacheDefaults';
import { DBObjectKeys, useIndexedDB } from '../../utils/cache/useLocalDB';

interface DataDecoded {
  parameters: Parameter[];
}

interface Parameter {
  valueDecoded: Transaction[];
}

interface Transaction {
  data: string;
}

export const useGetMultisigMetadata = (
  id: string | undefined,
  transactionType: ActivityTransactionType | undefined
) => {
  const ipfsClient = useIPFSClient();
  const [multisigMetadata, setMultisigMetadata] = useState<undefined | ProposalMetadata | null>(
    undefined
  );
  const [setValue, getValue] = useIndexedDB(DBObjectKeys.DECODED_TRANSACTIONS);

  const fetchMultisigMetadata = useCallback(async () => {
    const cached: ProposalMetadata = await getValue(CacheKeys.MULTISIG_METADATA_PREFIX + id);
    if (cached) {
      setMultisigMetadata(cached);
      return;
    }

    const transaction = transactionType as SafeMultisigTransactionResponse;

    // transactionType either isn't SafeMultisigTransactionResponse, or
    // there is no dataDecoded field on it
    if (!transaction?.dataDecoded) return;

    // find the last transaction in the multiSend batch, which *should* be the metadata
    // transaction, which contains the IPFS hash as its data array
    const dataDecoded: DataDecoded = JSON.parse(JSON.stringify(transaction.dataDecoded));
    const transactions: Transaction[] = dataDecoded.parameters[0].valueDecoded;
    const encodedMetadata = transactions[transactions.length - 1].data;

    // if there is data there, see if it's the hash (it should be), then get the JSON
    // data from IPFS
    if (encodedMetadata) {
      try {
        const decoded = new utils.AbiCoder().decode(['string'], encodedMetadata);
        const ipfsHash = (decoded as string[])[0];
        const meta: ProposalMetadata = await ipfsClient.cat(ipfsHash);

        // cache the metadata JSON
        await setValue(CacheKeys.MULTISIG_METADATA_PREFIX + id, meta);

        setMultisigMetadata(meta);
      } catch (e) {
        setMultisigMetadata(null);
      }
    }
  }, [getValue, id, ipfsClient, setValue, transactionType]);

  useEffect(() => {
    if (multisigMetadata === undefined && id) fetchMultisigMetadata();
  }, [multisigMetadata, fetchMultisigMetadata, id]);

  return { multisigMetadata };
};
