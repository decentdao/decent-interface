import { Box } from '@chakra-ui/react';
import { Formik } from 'formik';
import { useDAOCreateSchema } from '../../hooks/schemas/DAOCreate/useDAOCreateSchema';
import { GovernanceTypes } from '../../providers/Fractal/types';
import StepController from './StepController';
import { initialState } from './constants';

import { CreatorFormState, DAOTrigger } from './types';

function DaoCreator(props: { pending?: boolean; deployDAO: DAOTrigger; isSubDAO?: boolean }) {
  console.log('🚀 ~ file: index.tsx:11 ~ props', props);
  const { createDAOValidation } = useDAOCreateSchema();

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
