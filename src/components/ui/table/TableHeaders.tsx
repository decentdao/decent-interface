import { TableHeader } from '.';

export function FundingTableHeader() {
  return (
    <TableHeader
      gridType="grid-cols-funding-token"
      positions={['', '', 'justify-end', 'justify-end', '']}
      titles={['Symbol', 'Name', 'Available', 'Total', ' ']}
    />
  );
}

export function NFTFundingTableHeader() {
  return (
    <TableHeader
      gridType="grid-cols-funding-nft"
      positions={['', '', 'justify-end', 'justify-end', '']}
      titles={['Symbol', 'Name', 'Token Id', ' ']}
    />
  );
}
export function TreasuryTableHeader() {
  return (
    <TableHeader
      gridType="grid-cols-treasury-token"
      positions={[]}
      titles={['Symbol', 'Name', 'Amount']}
    />
  );
}
export function TreasuryNFTTableHeader() {
  return (
    <TableHeader
      gridType="grid-cols-treasury-nft"
      positions={[]}
      titles={['Symbol', 'Name', 'Token Id']}
    />
  );
}
