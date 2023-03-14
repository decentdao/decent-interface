import { GnosisSafe } from '@fractal-framework/fractal-contracts';
import { GnosisDAO } from '../components/DaoCreator/types';
import { buildContractCall } from '../helpers';
import { SafeTransaction } from '../types';
import { BaseContracts } from './types/contracts';

export class MultisigTxBuilder {
  private baseContracts: BaseContracts;
  private readonly daoData: GnosisDAO;
  private readonly safeContract: GnosisSafe;

  constructor(baseContracts: BaseContracts, daoData: GnosisDAO, safeContract: GnosisSafe) {
    this.baseContracts = baseContracts;
    this.daoData = daoData;
    this.safeContract = safeContract;
  }

  public signatures = (): string => {
    return (
      '0x000000000000000000000000' +
      this.baseContracts.multiSendContract.address.slice(2) +
      '0000000000000000000000000000000000000000000000000000000000000000' +
      '01'
    );
  };

  public buildRemoveMultiSendOwnerTx(): SafeTransaction {
    return buildContractCall(
      this.safeContract!,
      'removeOwner',
      [
        this.daoData.trustedAddresses[this.daoData.trustedAddresses.length - 1],
        this.baseContracts.multiSendContract.address,
        this.daoData.signatureThreshold,
      ],
      0,
      false
    );
  }
}
