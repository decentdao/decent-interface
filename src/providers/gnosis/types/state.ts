export interface Gnosis extends GnosisInformation {
  isLoading: boolean;
  contractAddress?: string;
  name?: string;
}

export interface GnosisInformation {
  nonce?: number;
  threshold: number;
  owners: string[];
  isSigner: boolean;
}
