import { Box } from '@chakra-ui/react';
import { Formik } from 'formik';
import { useDAOCreateSchema } from '../../hooks/schemas/DAOCreate/useDAOCreateSchema';
import { DAOTrigger, CreatorFormState, GovernanceTypes } from '../../types';
import StepController from './StepController';
import { initialState } from './constants';

import { usePrepareFormData } from './hooks/usePrepareFormData';

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
          const vetoGuard = isSubDAO ? values.vetoGuard : undefined;
          switch (choosenGovernance) {
            case GovernanceTypes.GNOSIS_SAFE: {
              const data = await prepareMultisigFormData({
                ...values.essentials,
                ...values.gnosis,
                vetoGuard,
              });
              deployDAO(data);
              return;
            }
            case GovernanceTypes.GNOSIS_SAFE_USUL: {
              const data = await prepareGnosisUsulFormData({
                ...values.essentials,
                ...values.govModule,
                ...values.govToken,
                vetoGuard,
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
              isSubDAO={isSubDAO}
              {...rest}
            />
          </form>
        )}
      </Formik>
    </Box>
  );
}

export default DaoCreator;
