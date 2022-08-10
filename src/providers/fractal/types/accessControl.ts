export type ACRoleListener = (
  target: string,
  functionDesc: string,
  encodedSig: string,
  role: string,
  _: any
) => void;
