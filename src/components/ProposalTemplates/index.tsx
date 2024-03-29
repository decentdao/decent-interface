import { Flex, Box, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DAO_ROUTES } from '../../constants/routes';
import useSubmitProposal from '../../hooks/DAO/proposal/useSubmitProposal';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { EmptyBox } from '../ui/containers/EmptyBox';
import { InfoBoxLoader } from '../ui/loaders/InfoBoxLoader';
import ProposalTemplateCard from './ProposalTemplateCard';

export default function ProposalTemplates() {
  const { t } = useTranslation('proposalTemplate');
  const {
    node: { daoAddress },
    governance: { proposalTemplates },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();
  const { canUserCreateProposal } = useSubmitProposal();

  return (
    <Flex
      flexDirection={proposalTemplates && proposalTemplates.length > 0 ? 'row' : 'column'}
      flexWrap="wrap"
      gap="1rem"
    >
      {!proposalTemplates ? (
        <Box>
          <InfoBoxLoader />
        </Box>
      ) : proposalTemplates.length > 0 ? (
        proposalTemplates.map((proposalTemplate, i) => (
          <ProposalTemplateCard
            key={i}
            proposalTemplate={proposalTemplate}
            templateIndex={i}
          />
        ))
      ) : (
        <EmptyBox emptyText={t('emptyProposalTemplates')}>
          {canUserCreateProposal && daoAddress && (
            <Link to={DAO_ROUTES.proposalTemplateNew.relative(addressPrefix, daoAddress)}>
              <Button
                variant="text"
                textStyle="text-xl-mono-bold"
              >
                {t('emptyProposalTemplatesCreateMessage')}
              </Button>
            </Link>
          )}
        </EmptyBox>
      )}
    </Flex>
  );
}
