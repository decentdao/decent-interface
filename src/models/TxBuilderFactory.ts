import { GnosisSafe, GnosisSafe__factory } from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { GnosisDAO, SubDAO, TokenGovernanceDAO } from '../components/DaoCreator/provider/types';
import { getRandomBytes } from '../helpers';
import { SafeTransaction } from '../types';
import { BaseTxBuilder } from './BaseTxBuilder';
import { DaoTxBuilder } from './DaoTxBuilder';
import { MultisigTxBuilder } from './MultisigTxBuilder';
import { UsulTxBuilder } from './UsulTxBuilder';
import { VetoGuardTxBuilder } from './VetoGuardTxBuilder';
import { gnosisSafeData } from './helpers/gnosisSafeData';
import { BaseContracts, UsulContracts } from './types/contracts';

export class TxBuilderFactory extends BaseTxBuilder {
  private readonly saltNum: string;

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
    super(
      signerOrProvider,
      baseContracts,
      usulContracts,
      daoData,
      parentDAOAddress,
      parentTokenAddress
    );

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

  public createVetoGuardTxBuilder(
    usulAddress?: string,
    strategyAddress?: string
  ): VetoGuardTxBuilder {
    return new VetoGuardTxBuilder(
      this.signerOrProvider,
      this.baseContracts,
      this.daoData as SubDAO,
      this.safeContract!,
      this.saltNum,
      this.parentDAOAddress!,
      this.parentTokenAddress,
      this.usulContracts,
      usulAddress,
      strategyAddress
    );
  }

  public createMultiSigTxBuilder(): MultisigTxBuilder {
    return new MultisigTxBuilder(this.baseContracts, this.daoData as GnosisDAO, this.safeContract!);
  }

  public createUsulTxBuilder(): UsulTxBuilder {
    return new UsulTxBuilder(
      this.signerOrProvider,
      this.baseContracts,
      this.usulContracts!,
      this.daoData as GnosisDAO,
      this.safeContract!
    );
  }
}
