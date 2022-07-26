import StepController from './DisplayStepController';

import { CreatorProvider } from './provider/CreatorProvider';
import { DAOTrigger } from './provider/types';

function DaoCreator({
  pending,
  nextTrigger,
  isSubDAO,
}: {
  pending?: boolean;
  nextTrigger: DAOTrigger;
  isSubDAO?: boolean;
}) {
  return (
    <CreatorProvider
      daoTrigger={nextTrigger}
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
