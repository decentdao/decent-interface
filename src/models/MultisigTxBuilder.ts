import { Address } from 'viem';
import GnosisSafeL2Abi from '../assets/abi/GnosisSafeL2';
import { buildContractCallViem } from '../helpers';
import { BaseContracts, SafeMultisigDAO, SafeTransaction } from '../types';

export class MultisigTxBuilder {
  private baseContracts: BaseContracts;
  private readonly daoData: SafeMultisigDAO;
  private readonly safeContractAddress: Address;

  constructor(
    baseContracts: BaseContracts,
    daoData: SafeMultisigDAO,
    safeContractAddress: Address,
  ) {
    this.baseContracts = baseContracts;
    this.daoData = daoData;
    this.safeContractAddress = safeContractAddress;
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
    return buildContractCallViem(
      GnosisSafeL2Abi,
      this.safeContractAddress,
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
