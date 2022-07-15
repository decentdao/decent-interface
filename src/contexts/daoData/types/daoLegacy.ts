export type DAOCreationListener = (
  _daoAddress: string,
  _accessControl: string,
  _sender: string,
  _creator: string,
  event: any
) => Promise<void>;
