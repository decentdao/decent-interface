import { Card } from '../ui/cards/Card';
import { BarLoader } from '../ui/loaders/BarLoader';

export function RoleCardLoading() {
  return (
    <Card
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="6rem"
    >
      <BarLoader />
    </Card>
  );
}
