import { TransactionData } from "./index";
import ContentBoxTitle from "../../../../ui/ContentBoxTitle";
import { TextButton } from "../../../../ui/forms/Button";
import Input from "../../../../ui/forms/Input";
import InputBox from "../../../../ui/forms/InputBox";
import ContentBox from "../../../../ui/ContentBox";
import { checkAddress } from "../../../../../hooks/useAddress";
import { useWeb3 } from "../../../../../web3";
import { ethers } from "ethers";

interface TransactionProps {
  transaction: TransactionData;
  transactionNumber: number;
  updateTransaction: (transactionData: TransactionData, transactionNumber: number) => void;
  removeTransaction: (transactionNumber: number) => void;
  errorMap: Map<number, { address: string | null; fragment: string | null }>;
  setError: (key: number, errorType: "address" | "fragment", error: string | null) => void;
  transactionCount: number;
}

const Transaction = ({ transaction, transactionNumber, errorMap, setError, updateTransaction, removeTransaction, transactionCount }: TransactionProps) => {
  const { provider } = useWeb3();
  let error: string | null = null;

  const validateFunctionData = (functionName: string, functionSignature: string, parameters: string): string | null => {
    const _functionSignature = `function ${functionName}(${functionSignature})`
    const _parameters = `[${parameters}]`
    let error: string | null = null;
    try {
      new ethers.utils.Interface([_functionSignature]).encodeFunctionData(functionName, JSON.parse(_parameters));
    } catch (err) {
      error = "Unsupported fragment";
    } finally {
      return error;
    }
  };

  const updateTargetAddress = async (targetAddress: string) => {
    const newTransactionData = Object.assign({}, transaction);
    newTransactionData.targetAddress = targetAddress;
    if (targetAddress.trim()) {
      const isValidAddress = await checkAddress(provider, targetAddress);
      if (!isValidAddress) {
        error = "Address Invalid";
      }
    }
    setError(transactionNumber, "address", error);
    updateTransaction(newTransactionData, transactionNumber);
  };

  const updateFunctionName = (functionName: string) => {
    const newTransactionData = Object.assign({}, transaction);
    newTransactionData.functionName = functionName;
    const error = validateFunctionData(functionName, transaction.functionSignature, transaction.parameters);
    setError(transactionNumber, "fragment", error);
    updateTransaction(newTransactionData, transactionNumber);
  };

  const updateFunctionSignature = (functionSignature: string) => {
    const newTransactionData = Object.assign({}, transaction);
    newTransactionData.functionSignature = functionSignature;
    const error = validateFunctionData(transaction.functionName, functionSignature, transaction.parameters);
    setError(transactionNumber, "fragment", error);
    updateTransaction(newTransactionData, transactionNumber);
  };

  const updateParameters = (parameters: string) => {
    const newTransactionData = Object.assign({}, transaction);
    newTransactionData.parameters = parameters;
    const error = validateFunctionData(transaction.functionName, transaction.functionSignature, parameters);
    setError(transactionNumber, "fragment", error);
    updateTransaction(newTransactionData, transactionNumber);
  };

  return (
    <ContentBox>
      <div className="flex justify-between">
        <ContentBoxTitle>Transaction</ContentBoxTitle>
        {transactionCount > 1 && (
          <div className="flex justify-end">
            <TextButton className="mx-0 px-0 w-fit" onClick={() => removeTransaction(transactionNumber)} label="Remove Transaction" />
          </div>
        )}
      </div>
      <InputBox>
        <Input
          type="text"
          value={transaction.targetAddress}
          onChange={(e) => updateTargetAddress(e.target.value)}
          label="Target Address"
          helperText="The smart contract address this proposal will modify"
          disabled={false}
          errorMessage={errorMap.get(transactionNumber)?.address || ""}
        />
      </InputBox>
      <InputBox>
        <Input
          type="text"
          value={transaction.functionName}
          onChange={(e) => updateFunctionName(e.target.value)}
          label="Function Name"
          exampleText="transfer"
          helperText="The name of the function to be called if this proposal passes"
          errorMessage={errorMap.get(transactionNumber)?.fragment || ""}
        />
      </InputBox>
      <InputBox>
        <Input
          type="text"
          value={transaction.functionSignature}
          onChange={(e) => updateFunctionSignature(e.target.value)}
          label="Function Signature"
          helperText="The function of the smart contract (above) to be called if this proposal passes"
          disabled={false}
          exampleText="address to, uint amount"
          errorMessage={errorMap.get(transactionNumber)?.fragment || ""}
        />
      </InputBox>
      <InputBox>
        <Input
          type="text"
          value={transaction.parameters}
          onChange={(e) => updateParameters(e.target.value)}
          label="Parameters"
          helperText="Values used to call the function (comma separated)"
          disabled={false}
          exampleText='"0xADC74eE329a23060d3CB431Be0AB313740c191E7", 500'
          errorMessage={errorMap.get(transactionNumber)?.fragment || ""}
        />
      </InputBox>
    </ContentBox>
  );
};

export default Transaction;
