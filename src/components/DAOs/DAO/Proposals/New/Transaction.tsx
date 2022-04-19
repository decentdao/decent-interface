import CreateDAOInput from "../../../../ui/CreateDAOInput";
import { TransactionData } from "./index";

const Transaction = ({
  transaction,
  transactionNumber,
  updateTransaction,
  removeTransaction,
  transactionCount,
}: {
  transaction: TransactionData;
  transactionNumber: number;
  updateTransaction: (
    transactionData: TransactionData,
    transactionNumber: number
  ) => void;
  removeTransaction: (transactionNumber: number) => void;
  transactionCount: number;
}) => {
  const updateTargetAddress = (targetAddress: string) => {
    const newTransactionData = {
      targetAddress: targetAddress,
      functionName: transaction.functionName,
      functionSignature: transaction.functionSignature,
      parameters: transaction.parameters,
    };

    updateTransaction(newTransactionData, transactionNumber);
  };

  const updateFunctionName = (functionName: string) => {
    const newTransactionData = {
      targetAddress: transaction.targetAddress,
      functionName: functionName,
      functionSignature: transaction.functionSignature,
      parameters: transaction.parameters,
    };

    updateTransaction(newTransactionData, transactionNumber);
  };

  const updateFunctionSignature = (functionSignature: string) => {
    const newTransactionData = {
      targetAddress: transaction.targetAddress,
      functionName: transaction.functionName,
      functionSignature: functionSignature,
      parameters: transaction.parameters,
    };

    updateTransaction(newTransactionData, transactionNumber);
  };

  const updateParameters = (parameters: string) => {
    const newTransactionData = {
      targetAddress: transaction.targetAddress,
      functionName: transaction.functionName,
      functionSignature: transaction.functionSignature,
      parameters: parameters,
    };

    updateTransaction(newTransactionData, transactionNumber);
  };

  return (
    <div className="mx-auto bg-slate-100 px-8 mt-4 mb-8 pt-8 pb-8 content-center">
      <div className="flex flex-row">
        <div className="flex flex-grow pb-8 text-lg">Transaction</div>
        {transactionCount > 1 && (
          <div
            className="flex pb-8 text-sm cursor-pointer"
            onClick={() => removeTransaction(transactionNumber)}
          >
            Remove Transaction
          </div>
        )}
      </div>
      <CreateDAOInput
        dataType="text"
        value={transaction.targetAddress}
        onChange={(e) => updateTargetAddress(e)}
        label="Target Address"
        helperText="The smart contract address this proposal will modify"
        disabled={false}
      />
      <CreateDAOInput
        dataType="text"
        value={transaction.functionName}
        onChange={(e) => updateFunctionName(e)}
        label="Function Name"
        helperText="The name of the function to be called if this proposal passes"
        disabled={false}
      />
      <CreateDAOInput
        dataType="text"
        value={transaction.functionSignature}
        onChange={(e) => updateFunctionSignature(e)}
        label="Function Signature"
        helperText="The function of the smart contract (above) to be called if this proposal passes"
        disabled={false}
      />
      <CreateDAOInput
        dataType="text"
        value={transaction.parameters}
        onChange={(e) => updateParameters(e)}
        label="Parameters"
        helperText="Values used to call the function (comma separated)"
        disabled={false}
      />
    </div>
  );
};

export default Transaction;
