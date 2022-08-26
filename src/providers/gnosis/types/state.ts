export interface Gnosis extends GnosisInformation {
  isLoading: boolean;
  contractAddress?: string;
  name?: string;
}

export interface GnosisInformation {
  threshold: number;
  owners: string[];
  isSigner: boolean;
}
