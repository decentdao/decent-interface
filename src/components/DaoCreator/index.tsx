import { Box } from '@chakra-ui/react';
import { Formik } from 'formik';
import { GovernanceTypes } from '../../providers/Fractal/types';
import { initialState } from './provider/constants';

import { CreatorFormState, DAOTrigger } from './provider/types';
import StepController from './refactor/StepController';
import { useCreateSchema } from './refactor/useCreateSchema';

function DaoCreator({
  pending,
  deployDAO,
  isSubDAO,
}: {
  pending?: boolean;
  deployDAO: DAOTrigger;
  isSubDAO?: boolean;
}) {
  const { createDAOValidation } = useCreateSchema();

  return (
    <Box>
      <Formik<CreatorFormState>
        initialValues={initialState}
        validationSchema={createDAOValidation}
        onSubmit={async values => {
          const choosenGovernance = values.essentials.governance;
          switch (choosenGovernance) {
            case GovernanceTypes.GNOSIS_SAFE: {
              // const trustedAddresses = values.gnosis.trustedAddresses.map(
              //   address => addressValidationMap.current.get(address)!.address
              // );
              // deployDAO({ ...values.essentials, ...values.gnosis, trustedAddresses });
              return;
            }
            case GovernanceTypes.GNOSIS_SAFE_USUL: {
              return;
            }
          }
        }}
        validateOnMount
      >
        {({ handleSubmit, ...rest }) => (
          <form onSubmit={handleSubmit}>
            <StepController {...rest} />
          </form>
        )}
      </Formik>
    </Box>
  );
}

export default DaoCreator;
