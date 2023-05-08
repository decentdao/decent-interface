'use client';

import { Box } from '@chakra-ui/react';
import { Formik } from 'formik';
import { useDAOCreateSchema } from '../../hooks/schemas/DAOCreate/useDAOCreateSchema';
import { DAOTrigger, CreatorFormState, StrategyType } from '../../types';
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
  const { prepareMultisigFormData, prepareAzoriusFormData } = usePrepareFormData();
  return (
    <Box>
      <Formik<CreatorFormState>
        initialValues={initialState}
        validationSchema={createDAOValidation}
        onSubmit={async values => {
          const choosenGovernance = values.essentials.governance;
          const freezeGuard = isSubDAO ? values.freezeGuard : undefined;
          switch (choosenGovernance) {
            case StrategyType.MULTISIG: {
              const data = await prepareMultisigFormData({
                ...values.essentials,
                ...values.gnosis,
                freezeGuard,
              });
              deployDAO(data);
              return;
            }
            case StrategyType.AZORIUS: {
              const data = await prepareAzoriusFormData({
                ...values.essentials,
                ...values.govModule,
                ...values.govToken,
                freezeGuard,
              });
              deployDAO(data);
              return;
            }
          }
        }}
        isInitialValid={false}
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
