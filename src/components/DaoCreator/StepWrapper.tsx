import { Box, Text } from '@chakra-ui/react';
import { Trash } from '@decent-org/fractal-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BASE_ROUTES } from '../../routes/constants';
import PageHeader from '../ui/page/Header/PageHeader';

interface IStepWrapper {
  titleKey: string;
  children: ReactNode;
}

export function StepWrapper({ titleKey, children }: IStepWrapper) {
  const { t } = useTranslation(['daoCreate']);
  const navigate = useNavigate();
  return (
    <Box>
      <PageHeader
        hasDAOLink={false}
        breadcrumbs={[
          {
            title: t('homeButtonCreate'),
            path: '',
          },
        ]}
        ButtonIcon={Trash}
        buttonVariant="secondary"
        buttonClick={() => navigate(BASE_ROUTES.landing)}
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
