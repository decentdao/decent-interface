import { ethers } from 'ethers';
import useSafeContracts from '../hooks/safe/useSafeContracts';
import { useFractal } from '../providers/Fractal/hooks/useFractal';
import { shuffle } from './arrays';

export const notProd = () => {
  return process.env.NODE_ENV !== 'production';
};

export const useProposeStuff = (doSomething: Function) => {
  const {
    gnosis: { safe },
  } = useFractal();
  const { fractalNameRegistryContract } = useSafeContracts();

  //Copied from Transaction.tsx
  const encodeFunctionData = (
    functionName: string,
    dirtyfunctionSignature: string,
    dirtyParameters: string
  ): string | undefined => {
    const functionSignature = `function ${functionName}(${dirtyfunctionSignature})`;
    const parameters = !!dirtyParameters
      ? dirtyParameters.split(',').map(p => (p = p.trim()))
      : undefined;
    try {
      return new ethers.utils.Interface([functionSignature]).encodeFunctionData(
        functionName,
        parameters
      );
    } catch (e) {
      return;
    }
  };

  //Add DUCK NFT transaction
  const randomDuckNFT = {
    targetAddress: '0x9caf3f136f67696e8bc92ca12f5ebd90c4ea93b1',
    functionName: 'mint',
    functionSignature:
      'string _collectionName, string _collectionSymbol, string _tokenName, string _tokenDescription, string _tokenImage, address _recipient',
    parameters: `Random Duck, DCK, A duck, This random duck NFT was generated to test Fractal. Quack quack., https://random-d.uk/api/${
      Math.floor(Math.random() * 284) + 1
    }.jpg, ${safe.address}`,
    isExpanded: true,
    encodedFunctionData: '',
  };
  randomDuckNFT.encodedFunctionData =
    encodeFunctionData(
      randomDuckNFT.functionName,
      randomDuckNFT.functionSignature,
      randomDuckNFT.parameters
    ) || '';

  //Add Change DAO name transaction
  const today = new Date().toLocaleString('default', { weekday: 'long' });
  const daoNameChange = {
    targetAddress: fractalNameRegistryContract?.address,
    functionName: 'updateDAOName',
    functionSignature: 'string _name',
    parameters: `${today} DAO`,
    isExpanded: true,
    encodedFunctionData: '',
  };
  daoNameChange.encodedFunctionData =
    encodeFunctionData(
      daoNameChange.functionName,
      daoNameChange.functionSignature,
      daoNameChange.parameters
    ) || '';

  return () => {
    doSomething(shuffle([randomDuckNFT, daoNameChange]));
  };
};

export const testErrorBoundary = () => {
  const empty: string[] = [];
  empty[1].charAt(1);
};
