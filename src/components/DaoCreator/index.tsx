import { Box } from '@chakra-ui/react';
import { Formik } from 'formik';
import { useDAOCreateSchema } from '../../hooks/schemas/DAOCreate/useDAOCreateSchema';
import { GovernanceTypes } from '../../providers/Fractal/types';
import StepController from './StepController';
import { initialState } from './constants';

import { usePrepareFormData } from './prepare/usePrepareFormData';
import { CreatorFormState, DAOTrigger } from './types';

function DaoCreator({
  deployDAO,
  pending,
  isSubDAO,
}: {
  pending?: boolean;
  deployDAO: DAOTrigger;
  isSubDAO?: boolean;
}) {
  const { createDAOValidation } = useDAOCreateSchema({ isSubDAO });
  const { prepareMultisigFormData, prepareGnosisUsulFormData } = usePrepareFormData();
  return (
    <Box>
      <Formik<CreatorFormState>
        initialValues={initialState}
        validationSchema={createDAOValidation}
        onSubmit={async values => {
          const choosenGovernance = values.essentials.governance;
          switch (choosenGovernance) {
            case GovernanceTypes.GNOSIS_SAFE: {
              const data = await prepareMultisigFormData({
                ...values.essentials,
                ...values.gnosis,
              });
              deployDAO(data);
              return;
            }
            case GovernanceTypes.GNOSIS_SAFE_USUL: {
              const data = await prepareGnosisUsulFormData({
                ...values.essentials,
                ...values.govModule,
                ...values.govToken,
              });
              deployDAO(data);
              return;
            }
          }
        }}
        validateOnMount
      >
        {({ handleSubmit, ...rest }) => (
          <form onSubmit={handleSubmit}>
            <StepController
              transactionPending={pending}
              {...rest}
            />
          </form>
        )}
      </Formik>
    </Box>
  );
}

export default DaoCreator;
