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
}

export function StepWrapper({
  titleKey,
  isSubDAO,
  isFormSubmitting,
  children,
  mode,
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
              textStyle="display-2xl"
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
              terminus: t(!isSubDAO ? 'buttonCreate' : 'labelCreateSubDAOProposal'),
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
