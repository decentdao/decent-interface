export interface TransactionData {
  targetAddress: string;
  functionName: string;
  functionSignature: string;
  parameters: string;
  addressError?: string;
  fragmentError?: string;
}
