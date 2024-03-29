import { Box, Flex, Text } from '@chakra-ui/react';
import { Trash } from '@decent-org/fractal-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../constants/common';
import { BASE_ROUTES, DAO_ROUTES } from '../../constants/routes';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import PageHeader from '../ui/page/Header/PageHeader';
import { DAOCreateMode } from './formComponents/EstablishEssentials';

interface IStepWrapper {
  titleKey: string;
  isSubDAO?: boolean;
  isFormSubmitting?: boolean;
  shouldWrapChildren?: boolean;
  children: ReactNode;
  mode: DAOCreateMode;
}

export function StepWrapper({
  titleKey,
  isSubDAO,
  isFormSubmitting,
  children,
  mode,
  shouldWrapChildren = true,
}: IStepWrapper) {
  const {
    node: { daoAddress },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();
  const { t } = useTranslation(['daoCreate']);
  const navigate = useNavigate();

  const isEdit = mode === DAOCreateMode.EDIT;
  return (
    <Box>
      {isEdit ? (
        <Box marginBottom="2rem">
          <Flex
            alignItems="center"
            w="full"
          >
            <Text
              textStyle="text-2xl-mono-regular"
              color="grayscale.100"
            >
              {t(titleKey)}
            </Text>
          </Flex>
        </Box>
      ) : (
        <PageHeader
          title={t(titleKey)}
          hasDAOLink={!!isSubDAO}
          breadcrumbs={[
            {
              terminus: t(!isSubDAO ? 'buttonCreate' : 'labelCreateSubDAOProposal'),
              path: '',
            },
          ]}
          ButtonIcon={Trash}
          buttonVariant="secondary"
          isButtonDisabled={isFormSubmitting}
          buttonClick={() =>
            navigate(
              !isSubDAO || !daoAddress
                ? BASE_ROUTES.landing
                : DAO_ROUTES.dao.relative(addressPrefix, daoAddress),
            )
          }
        />
      )}
      {shouldWrapChildren ? (
        <Box
          bg={BACKGROUND_SEMI_TRANSPARENT}
          rounded="lg"
          mt={8}
          px={4}
          py={8}
        >
          {children}
        </Box>
      ) : (
        children
      )}
    </Box>
  );
}
