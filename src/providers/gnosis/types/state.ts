export interface Gnosis extends GnosisInformation {
  isLoading: boolean;
  contractAddress?: string;
  name?: string;
  isSigner: boolean;
}

export interface GnosisInformation {
  nonce?: number;
  threshold: number;
  owners: string[];
}
