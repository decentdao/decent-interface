import { Box, Text } from '@chakra-ui/react';
import { Trash } from '@decent-org/fractal-ui';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BASE_ROUTES, DAO_ROUTES } from '../../constants/routes';
import { useFractal } from '../../providers/App/AppProvider';
import PageHeader from '../ui/page/Header/PageHeader';

interface IStepWrapper {
  titleKey: string;
  isSubDAO?: boolean;
  isFormSubmitting?: boolean;
  children: ReactNode;
}

export function StepWrapper({ titleKey, isSubDAO, isFormSubmitting, children }: IStepWrapper) {
  const {
    node: { safe },
  } = useFractal();
  const { t } = useTranslation(['daoCreate']);
  const { push } = useRouter();
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
          push(!isSubDAO ? BASE_ROUTES.landing : DAO_ROUTES.dao.relative(safe?.address))
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
