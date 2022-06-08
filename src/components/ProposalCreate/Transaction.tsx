import ContentBoxTitle from '../ui/ContentBoxTitle';
import { TextButton } from '../ui/forms/Button';
import Input from '../ui/forms/Input';
import InputBox from '../ui/forms/InputBox';
import ContentBox from '../ui/ContentBox';
import { checkAddress } from '../../hooks/useAddress';
import { useWeb3 } from '../../contexts/web3Data';
import { ethers } from 'ethers';
import { TransactionData } from '../../types/transaction';

interface TransactionProps {
  transaction: TransactionData;
  transactionNumber: number;
  pending: boolean;
  updateTransaction: (transactionData: TransactionData, transactionNumber: number) => void;
  removeTransaction: (transactionNumber: number) => void;
  transactionCount: number;
}

function Transaction({
  transaction,
  transactionNumber,
  pending,
  updateTransaction,
  removeTransaction,
  transactionCount,
}: TransactionProps) {
  const [{ provider }] = useWeb3();

  const validateFunctionData = (
    functionName: string,
    functionSignature: string,
    parameters: string
  ): boolean => {
    const functionSignatureStr = `function ${functionName}(${functionSignature})`;
    const parametersArr = `[${parameters}]`;
    try {
      new ethers.utils.Interface([functionSignatureStr]).encodeFunctionData(
        functionName,
        JSON.parse(parametersArr)
      );
      return true;
    } catch {
      return false;
    }
  };

  const updateTargetAddress = async (targetAddress: string) => {
    const newTransactionData = Object.assign({}, transaction);
    newTransactionData.targetAddress = targetAddress;
    let isValidAddress = false;
    if (targetAddress.trim()) {
      isValidAddress = await checkAddress(provider, targetAddress);
    }
    newTransactionData.addressError =
      !isValidAddress && targetAddress.trim() ? 'Invalid address' : undefined;
    updateTransaction(newTransactionData, transactionNumber);
  };

  const updateFunctionName = (functionName: string) => {
    const newTransactionData = Object.assign({}, transaction);
    newTransactionData.functionName = functionName;
    const isValidFragment = validateFunctionData(
      functionName,
      transaction.functionSignature,
      transaction.parameters
    );
    newTransactionData.fragmentError = !isValidFragment ? 'Invalid fragments' : undefined;
    updateTransaction(newTransactionData, transactionNumber);
  };

  const updateFunctionSignature = (functionSignature: string) => {
    const newTransactionData = Object.assign({}, transaction);
    newTransactionData.functionSignature = functionSignature;
    const isValidFragment = validateFunctionData(
      transaction.functionName,
      functionSignature,
      transaction.parameters
    );
    newTransactionData.fragmentError = !isValidFragment ? 'Invalid fragments' : undefined;
    updateTransaction(newTransactionData, transactionNumber);
  };

  const updateParameters = (parameters: string) => {
    const newTransactionData = Object.assign({}, transaction);
    newTransactionData.parameters = parameters;
    const isValidFragment = validateFunctionData(
      transaction.functionName,
      transaction.functionSignature,
      parameters
    );
    newTransactionData.fragmentError = !isValidFragment ? 'Invalid fragments' : undefined;
    updateTransaction(newTransactionData, transactionNumber);
  };
  return (
    <ContentBox>
      <div className="flex justify-between">
        <ContentBoxTitle>Transaction</ContentBoxTitle>
        {transactionCount > 1 && (
          <div className="flex justify-end">
            <TextButton
              className="mx-0 px-0 w-fit"
              onClick={() => removeTransaction(transactionNumber)}
              disabled={
                pending &&
                transaction.targetAddress.trim().length > 0 &&
                validateFunctionData(
                  transaction.functionName,
                  transaction.functionSignature,
                  transaction.parameters
                )
              }
              label="Remove Transaction"
            />
          </div>
        )}
      </div>
      <InputBox>
        <Input
          type="text"
          value={transaction.targetAddress}
          onChange={e => updateTargetAddress(e.target.value)}
          label="Target Address"
          helperText="The smart contract address this proposal will modify"
          disabled={pending}
          errorMessage={transaction.addressError}
        />
      </InputBox>
      <InputBox>
        <Input
          type="text"
          value={transaction.functionName}
          onChange={e => updateFunctionName(e.target.value)}
          label="Function Name"
          exampleText="transfer"
          disabled={pending}
          helperText="The name of the function to be called if this proposal passes"
          errorMessage={transaction.fragmentError}
        />
      </InputBox>
      <InputBox>
        <Input
          type="textarea"
          value={transaction.functionSignature}
          onChange={e => updateFunctionSignature(e.target.value)}
          label="Function Signature"
          helperText="The function of the smart contract (above) to be called if this proposal passes"
          disabled={pending}
          exampleText="address to, uint amount"
          errorMessage={transaction.fragmentError}
        />
      </InputBox>
      <InputBox>
        <Input
          type="textarea"
          value={transaction.parameters}
          onChange={e => updateParameters(e.target.value)}
          label="Parameters"
          helperText="Values used to call the function (comma separated)"
          disabled={pending}
          exampleText='"0xADC74eE329a23060d3CB431Be0AB313740c191E7", "1000000000000000000"'
          errorMessage={transaction.fragmentError}
        />
      </InputBox>
    </ContentBox>
  );
}

export default Transaction;
