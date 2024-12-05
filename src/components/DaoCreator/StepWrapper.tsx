import { Box, Flex, Text } from '@chakra-ui/react';
import { ArrowLeft } from '@phosphor-icons/react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BASE_ROUTES, DAO_ROUTES } from '../../constants/routes';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { useDaoInfoStore } from '../../store/daoInfo/useDaoInfoStore';
import PageHeader from '../ui/page/Header/PageHeader';
import { DAOCreateMode } from './formComponents/EstablishEssentials';

interface IStepWrapper {
  titleKey: string;
  isSubDAO?: boolean;
  isFormSubmitting?: boolean;
  shouldWrapChildren?: boolean;
  children: ReactNode;
  mode: DAOCreateMode;
  totalSteps: number;
  stepNumber: number;
}

function Step({ index, stepNumber }: { index: number; stepNumber: number }) {
  return (
    <Box
      width="100%"
      height="4px"
      bg={stepNumber === index ? 'lilac-0' : 'neutral-6'}
      borderRadius="full"
    ></Box>
  );
}

export function StepWrapper({
  titleKey,
  isSubDAO,
  isFormSubmitting,
  children,
  mode,
  totalSteps,
  stepNumber,
  shouldWrapChildren = true,
}: IStepWrapper) {
  const { safe } = useDaoInfoStore();
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
              textStyle="heading-large"
              color="white-0"
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
              terminus: t(!isSubDAO ? 'createNewDAO' : 'labelCreateSubDAOProposal'),
              path: '',
            },
          ]}
          ButtonIcon={ArrowLeft}
          buttonProps={{
            variant: 'secondary',
            isDisabled: isFormSubmitting,
            onClick: () =>
              navigate(
                !isSubDAO || !safe?.address
                  ? BASE_ROUTES.landing
                  : DAO_ROUTES.dao.relative(addressPrefix, safe.address),
              ),
          }}
        />
      )}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        mb="2rem"
        gap="0.25rem"
      >
        {Array.from({ length: totalSteps }, (_, index) => (
          <Step
            key={index}
            index={index + 1}
            stepNumber={stepNumber}
          />
        ))}
      </Flex>
      {shouldWrapChildren ? (
        <Box
          mt="1.5rem"
          padding="1.5rem"
          bg="neutral-2"
          borderRadius="0.25rem"
        >
          {children}
        </Box>
      ) : (
        children
      )}
    </Box>
  );
}
