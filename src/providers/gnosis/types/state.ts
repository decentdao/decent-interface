export interface Gnosis extends GnosisInformation {
  isLoading: boolean;
  safeAddress?: string;
  name?: string;
  isSigner: boolean;
}

export interface GnosisInformation {
  nonce?: number;
  threshold: number;
  owners: string[];
}
