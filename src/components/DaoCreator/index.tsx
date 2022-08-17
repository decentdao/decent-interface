import StepController from './DisplayStepController';

import { CreatorProvider } from './provider/CreatorProvider';
import { DAOTrigger } from './provider/types';

function DaoCreator({
  pending,
  deployDAO,
  isSubDAO,
}: {
  pending?: boolean;
  deployDAO: DAOTrigger;
  isSubDAO?: boolean;
}) {
  return (
    <CreatorProvider
      deployDAO={deployDAO}
      pending={pending}
      isSubDAO={isSubDAO}
    >
      <form onSubmit={e => e.preventDefault()}>
        <StepController />
      </form>
    </CreatorProvider>
  );
}

export default DaoCreator;
