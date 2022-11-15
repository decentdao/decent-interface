import { VEllipsis } from '@decent-org/fractal-ui';
import { Option, OptionMenu } from '../OptionMenu';

export function ManageDAOMenu({ options }: { options: Option[] }) {
  return (
    <OptionMenu
      icon={
        <VEllipsis
          boxSize="1.5rem"
          mt="0.25rem"
        />
      }
      titleKey={'titleManageDAO'}
      options={options}
      namespace={'menu'}
    />
  );
}
