import { TableHeader } from '.';

export function FundingTableHeader() {
  return (
    <TableHeader
      gridType="treasury"
      positions={['', '', 'justify-end', 'justify-end', '']}
      titles={['Symbol', 'Name', 'Available', 'Total', ' ']}
    />
  );
}
export function TreasuryTableHeader() {
  return (
    <TableHeader
      gridType="treasury"
      positions={[]}
      titles={['Symbol', 'Name', 'Amount']}
    />
  );
}
