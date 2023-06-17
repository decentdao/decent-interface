'use client';

import { Box } from '@chakra-ui/react';
import { Formik } from 'formik';
import { useDAOCreateSchema } from '../../hooks/schemas/DAOCreate/useDAOCreateSchema';
import { DAOTrigger, CreatorFormState, GovernanceModuleType } from '../../types';
import StepController from './StepController';
import { initialState } from './constants';

import { DAOCreateMode } from './formComponents/EstablishEssentials';
import { usePrepareFormData } from './hooks/usePrepareFormData';

function DaoCreator({
  deployDAO,
  pending,
  isSubDAO,
  mode,
}: {
  pending?: boolean;
  deployDAO: DAOTrigger;
  isSubDAO?: boolean;
  mode: DAOCreateMode;
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
          const freezeGuard = isSubDAO ? values.freeze : undefined;
          switch (choosenGovernance) {
            case GovernanceModuleType.MULTISIG: {
              const data = await prepareMultisigFormData({
                ...values.essentials,
                ...values.multisig,
                freezeGuard,
              });
              deployDAO(data);
              return;
            }
            case GovernanceModuleType.AZORIUS: {
              const data = await prepareAzoriusFormData({
                ...values.essentials,
                ...values.azorius,
                ...values.token,
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
              mode={mode}
              {...rest}
            />
          </form>
        )}
      </Formik>
    </Box>
  );
}

export default DaoCreator;
