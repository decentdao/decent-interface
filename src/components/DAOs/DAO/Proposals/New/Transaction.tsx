import CreateDAOInput from "../../../../ui/CreateDAOInput";
import { TransactionData } from "./index";
import ContentBoxTitle from "../../../../ui/ContentBoxTitle";
import { TextButton } from "../../../../ui/forms/Button";
import Input from "../../../../ui/forms/Input";
import InputBox from "../../../../ui/forms/InputBox";
import ContentBox from "../../../../ui/ContentBox";

const Transaction = ({
  transaction,
  transactionNumber,
  updateTransaction,
  removeTransaction,
  transactionCount,
}: {
  transaction: TransactionData;
  transactionNumber: number;
  updateTransaction: (transactionData: TransactionData, transactionNumber: number) => void;
  removeTransaction: (transactionNumber: number) => void;
  transactionCount: number;
}) => {
  const updateTargetAddress = (targetAddress: string) => {
    const newTransactionData = Object.assign({}, transaction);
    newTransactionData.targetAddress = targetAddress;

    updateTransaction(newTransactionData, transactionNumber);
  };

  const updateFunctionName = (functionName: string) => {
    const newTransactionData = Object.assign({}, transaction);
    newTransactionData.functionName = functionName;

    updateTransaction(newTransactionData, transactionNumber);
  };

  const updateFunctionSignature = (functionSignature: string) => {
    const newTransactionData = Object.assign({}, transaction);
    newTransactionData.functionSignature = functionSignature;

    updateTransaction(newTransactionData, transactionNumber);
  };

  const updateParameters = (parameters: string) => {
    const newTransactionData = Object.assign({}, transaction);
    newTransactionData.parameters = parameters;

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
        />
      </InputBox>
      <InputBox>
        <Input
          type="text"
          value={transaction.functionName}
          onChange={(e) => updateFunctionName(e.target.value)}
          label="Function Name"
          helperText="The name of the function to be called if this proposal passes"
          disabled={false}
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
          exampleText="scheduleBatch(address[], uint256[], bytes[], bytes32, bytes32, uint256)"
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
          exampleText="123, “something”, bytes[], 0x41685926A6372e0A3a777ed8B2221171d3022560, etc.."
        />
      </InputBox>
    </ContentBox>
  );
};

export default Transaction;
