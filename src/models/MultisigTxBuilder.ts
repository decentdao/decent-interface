import { SafeL2 } from '../assets/typechain-types/safe/contracts';
import { buildContractCall } from '../helpers';
import { BaseContracts, SafeMultisigDAO, SafeTransaction } from '../types';

export class MultisigTxBuilder {
  private baseContracts: BaseContracts;
  private readonly daoData: SafeMultisigDAO;
  private readonly safeContract: SafeL2;

  constructor(baseContracts: BaseContracts, daoData: SafeMultisigDAO, safeContract: SafeL2) {
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
      false,
    );
  }
}
