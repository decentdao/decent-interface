import { Box } from '@chakra-ui/react';
import { Formik } from 'formik';
import { useDAOCreateSchema } from '../../hooks/schemas/DAOCreate/useDAOCreateSchema';
import { DAOTrigger, CreatorFormState, GovernanceType } from '../../types';
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
  const { prepareMultisigFormData, prepareAzoriusERC20FormData, prepareAzoriusERC721FormData } =
    usePrepareFormData();
  return (
    <Box>
      <Formik<CreatorFormState>
        initialValues={initialState}
        validationSchema={createDAOValidation}
        onSubmit={async values => {
          const choosenGovernance = values.essentials.governance;
          const freezeGuard = isSubDAO ? values.freeze : undefined;

          switch (choosenGovernance) {
            case GovernanceType.MULTISIG: {
              const data = await prepareMultisigFormData({
                ...values.essentials,
                ...values.multisig,
                freezeGuard,
              });
              if (data) {
                deployDAO(data);
              }
              return;
            }
            case GovernanceType.AZORIUS_ERC20: {
              const data = await prepareAzoriusERC20FormData({
                ...values.essentials,
                ...values.azorius,
                ...values.erc20Token,
                freezeGuard,
              });
              if (data) {
                deployDAO(data);
              }
              return;
            }
            case GovernanceType.AZORIUS_ERC721: {
              const data = await prepareAzoriusERC721FormData({
                ...values.essentials,
                ...values.azorius,
                ...values.erc721Token,
                freezeGuard,
              });
              if (data) {
                deployDAO(data);
              }
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
