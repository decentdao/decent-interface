import { GnosisSafe, GnosisSafeProxyFactory } from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { getCreate2Address, solidityKeccak256 } from 'ethers/lib/utils';
import { MultiSend } from '../../assets/typechain-types/usul';
import { GnosisDAO } from '../../components/DaoCreator/types';
import { buildContractCall } from '../../helpers/crypto';
const { AddressZero, HashZero } = ethers.constants;

export const gnosisSafeData = async (
  multiSendContract: MultiSend,
  gnosisSafeFactoryContract: GnosisSafeProxyFactory,
  gnosisSafeSingletonContract: GnosisSafe,
  daoData: GnosisDAO,
  saltNum: string,
  hasUsul?: boolean
) => {
  const gnosisDaoData = daoData as GnosisDAO;

  const signers = hasUsul
    ? [multiSendContract.address]
    : [
        ...gnosisDaoData.trustedAddresses.map(trustedAddress => trustedAddress),
        multiSendContract.address,
      ];

  const createGnosisCalldata = gnosisSafeSingletonContract.interface.encodeFunctionData('setup', [
    signers,
    1, // Threshold
    AddressZero,
    HashZero,
    AddressZero,
    AddressZero,
    0,
    AddressZero,
  ]);

  const predictedGnosisSafeAddress = getCreate2Address(
    gnosisSafeFactoryContract.address,
    solidityKeccak256(
      ['bytes', 'uint256'],
      [solidityKeccak256(['bytes'], [createGnosisCalldata]), saltNum]
    ),
    solidityKeccak256(
      ['bytes', 'uint256'],
      [await gnosisSafeFactoryContract.proxyCreationCode(), gnosisSafeSingletonContract.address]
    )
  );

  const createSafeTx = buildContractCall(
    gnosisSafeFactoryContract,
    'createProxyWithNonce',
    [gnosisSafeSingletonContract.address, createGnosisCalldata, saltNum],
    0,
    false
  );

  return {
    predictedGnosisSafeAddress,
    createSafeTx,
  };
};
