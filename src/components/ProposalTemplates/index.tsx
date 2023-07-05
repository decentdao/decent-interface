import { Flex, Box, Button } from '@chakra-ui/react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { DAO_ROUTES } from '../../constants/routes';
import { useFractal } from '../../providers/App/AppProvider';
import { GovernanceSelectionType } from '../../types';
import { EmptyBox } from '../ui/containers/EmptyBox';
import { InfoBoxLoader } from '../ui/loaders/InfoBoxLoader';
import ProposalTemplateCard from './ProposalTemplateCard';

export default function ProposalTemplates() {
  const { t } = useTranslation('proposalTemplate');
  const {
    node: { daoAddress, safe },
    readOnly: { user },
    governance: { proposalTemplates, type },
  } = useFractal();

  const showCreateButton =
    type === GovernanceSelectionType.AZORIUS_ERC20 ||
    type === GovernanceSelectionType.AZORIUS_ERC721
      ? true
      : safe?.owners.includes(user.address || '');

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
          {showCreateButton && (
            <Link href={DAO_ROUTES.proposalTemplateNew.relative(daoAddress)}>
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
