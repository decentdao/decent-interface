import { VEllipsis } from '@decent-org/fractal-ui';
import { Option, OptionMenu } from '../OptionMenu';

const OPTIONS: Option[] = [
  { optionKey: 'optionCreateSubDAO', function: () => {} },
  { optionKey: 'optionInitiateFreeze', function: () => {} },
];

export function ManageDAOMenu() {
  return (
    <OptionMenu
      icon={<VEllipsis />}
      titleKey={'titleManageDAO'}
      options={OPTIONS}
      namespace={'menu'}
    />
  );
}
