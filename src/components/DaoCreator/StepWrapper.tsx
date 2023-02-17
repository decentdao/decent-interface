import { Box, Text } from '@chakra-ui/react';
import { Trash } from '@decent-org/fractal-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { BASE_ROUTES, DAO_ROUTES } from '../../routes/constants';
import PageHeader from '../ui/page/Header/PageHeader';

interface IStepWrapper {
  titleKey: string;
  isSubDAO?: boolean;
  isFormSubmitting?: boolean;
  children: ReactNode;
}

export function StepWrapper({ titleKey, isSubDAO, isFormSubmitting, children }: IStepWrapper) {
  const {
    gnosis: {
      safe: { address },
    },
  } = useFractal();
  const { t } = useTranslation(['daoCreate']);
  const navigate = useNavigate();
  return (
    <Box>
      <PageHeader
        hasDAOLink={!!isSubDAO}
        breadcrumbs={[
          {
            title: t(!isSubDAO ? 'homeButtonCreate' : 'labelCreateSubDAOProposal'),
            path: '',
          },
        ]}
        ButtonIcon={Trash}
        buttonVariant="secondary"
        isButtonDisabled={isFormSubmitting}
        buttonClick={() =>
          navigate(!isSubDAO ? BASE_ROUTES.landing : DAO_ROUTES.dao.relative(address))
        }
      />
      <Text
        textStyle="text-2xl-mono-regular"
        color="grayscale.100"
      >
        {t(titleKey)}
      </Text>
      <Box
        bg="black.900-semi-transparent"
        rounded="md"
        mt={8}
        px={4}
        py={8}
      >
        {children}
      </Box>
    </Box>
  );
}
