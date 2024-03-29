import { Box, Flex, Image, Text } from '@chakra-ui/react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DAO_ROUTES } from '../../../constants/routes';
import { useFractal } from '../../../providers/App/AppProvider';
import { ActivityEventType, FractalProposal, SnapshotProposal } from '../../../types';
import { DEFAULT_DATE_FORMAT } from '../../../utils';
import { ActivityDescription } from '../../Activity/ActivityDescription';
import { Badge } from '../../ui/badges/Badge';
import QuorumBadge from '../../ui/badges/QuorumBadge';

function ProposalCard({ proposal }: { proposal: FractalProposal }) {
  const {
    node: { daoAddress, daoNetwork },
  } = useFractal();
  const { t } = useTranslation('common');

  const eventDateLabel = t(
    proposal.eventType === ActivityEventType.Treasury
      ? proposal.transaction?.to === daoAddress
        ? 'received'
        : 'sent'
      : 'created',
  );

  const isSnapshotProposal = !!(proposal as SnapshotProposal).snapshotProposalId;

  if (!daoNetwork || !daoAddress) {
    return null;
  }

  return (
    <Link to={DAO_ROUTES.proposal.relative(daoNetwork, daoAddress, proposal.proposalId)}>
      <Box
        minHeight="6.25rem"
        bg="chocolate.900"
        _hover={{ bg: '#0B0A09' }}
        p="1.5rem"
        borderRadius="0.5rem"
      >
        {/* Top Row */}
        <Flex justifyContent="space-between">
          <Flex
            gap={2}
            alignItems="center"
          >
            <Badge
              labelKey={proposal.state!}
              size="sm"
              proposal={proposal}
            />
            {isSnapshotProposal && (
              <Image
                src="/images/snapshot-icon-fill.svg"
                alt={t('snapshot')}
                ml={1}
              />
            )}
          </Flex>
          <QuorumBadge proposal={proposal} />
        </Flex>
        <ActivityDescription activity={proposal} />
        <Box>
          {proposal.eventDate && (
            <Text
              mt={2}
              textStyle="text-base-sans-regular"
              color="#838383"
            >
              {eventDateLabel} {format(proposal.eventDate, DEFAULT_DATE_FORMAT)}
            </Text>
          )}
        </Box>
      </Box>
    </Link>
  );
}

export default ProposalCard;
