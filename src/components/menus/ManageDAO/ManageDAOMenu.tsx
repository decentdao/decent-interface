import { VEllipsis } from '@decent-org/fractal-ui';
import { Option, OptionMenu } from '../OptionMenu';

const OPTIONS: Option[] = [
  { optionKey: 'optionCreateSubDAO', function: () => {} }, // TODO subDAO creation hook
  { optionKey: 'optionInitiateFreeze', function: () => {} }, // TODO freeze hook (if parent voting holder)
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
