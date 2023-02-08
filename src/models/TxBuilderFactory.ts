import { GnosisSafe, GnosisSafe__factory } from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { GnosisDAO, SubDAO, TokenGovernanceDAO } from '../components/DaoCreator/provider/types';
import { getRandomBytes } from '../helpers';
import { gnosisSafeData } from '../helpers/BuildDAOTx/gnosisSafeData';
import { SafeTransaction } from '../types';
import { DaoTxBuilder } from './DaoTxBuilder';
import { MultisigTxBuilder } from './MultisigTxBuilder';
import { VetoGuardTxBuilder } from './VetoGuardTxBuilder';
import { BaseContracts, UsulContracts } from './types/contracts';

export class TxBuilderFactory {
  private baseContracts: BaseContracts;

  private readonly usulContracts: UsulContracts | undefined;

  private readonly daoData: GnosisDAO | TokenGovernanceDAO | SubDAO;

  private readonly signerOrProvider: ethers.Signer | any;

  private readonly parentDAOAddress?: string;

  private readonly parentTokenAddress?: string;

  private readonly saltNum;

  // Gnosis Safe Data
  public predictedGnosisSafeAddress: string | undefined;

  public createSafeTx: SafeTransaction | undefined;

  private safeContract: GnosisSafe | undefined;

  constructor(
    signerOrProvider: ethers.Signer | any,
    baseContracts: BaseContracts,
    usulContracts: UsulContracts | undefined,
    daoData: GnosisDAO | TokenGovernanceDAO | SubDAO,
    parentDAOAddress?: string,
    parentTokenAddress?: string
  ) {
    this.signerOrProvider = signerOrProvider;
    this.baseContracts = baseContracts;
    this.daoData = daoData;
    this.usulContracts = usulContracts;
    this.parentDAOAddress = parentDAOAddress;
    this.parentTokenAddress = parentTokenAddress;

    this.saltNum = getRandomBytes();
  }

  public async setupGnosisSafeData(): Promise<void> {
    const { predictedGnosisSafeAddress, createSafeTx } = await gnosisSafeData(
      this.baseContracts.multiSendContract,
      this.baseContracts.gnosisSafeFactoryContract,
      this.baseContracts.gnosisSafeSingletonContract,
      this.daoData as GnosisDAO,
      this.saltNum,
      !!this.usulContracts
    );

    const safeContract = GnosisSafe__factory.connect(
      predictedGnosisSafeAddress,
      this.signerOrProvider
    );

    this.predictedGnosisSafeAddress = predictedGnosisSafeAddress;
    this.createSafeTx = createSafeTx;
    this.safeContract = safeContract;
  }

  public createDaoTxBuilder(): DaoTxBuilder {
    return new DaoTxBuilder(
      this.signerOrProvider,
      this.baseContracts,
      this.usulContracts,
      this.daoData,
      this.saltNum,
      this.predictedGnosisSafeAddress!,
      this.createSafeTx!,
      this.safeContract!,
      this,
      this.parentDAOAddress,
      this.parentTokenAddress
    );
  }

  public createVetoGuardTxBuilder(): VetoGuardTxBuilder {
    return new VetoGuardTxBuilder(
      this.baseContracts,
      this.daoData as SubDAO,
      this.safeContract!,
      this.saltNum,
      this.parentDAOAddress!,
      this.parentTokenAddress
    );
  }

  public createMultiSigTxBuilder(): MultisigTxBuilder {
    return new MultisigTxBuilder(this.baseContracts, this.daoData as GnosisDAO, this.safeContract!);
  }
}
