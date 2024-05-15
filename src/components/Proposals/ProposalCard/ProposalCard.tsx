import { Box, Flex, Text } from '@chakra-ui/react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DAO_ROUTES } from '../../../constants/routes';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import {
  ActivityEventType,
  AzoriusProposal,
  FractalProposal,
  SnapshotProposal,
} from '../../../types';
import { DEFAULT_DATE_FORMAT } from '../../../utils';
import { ActivityDescription } from '../../Activity/ActivityDescription';
import { Badge } from '../../ui/badges/Badge';
import QuorumBadge from '../../ui/badges/QuorumBadge';
import { SnapshotIcon } from '../../ui/badges/Snapshot';

function ProposalCard({ proposal }: { proposal: FractalProposal }) {
  const {
    node: { daoAddress },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();
  const { t } = useTranslation('common');

  const eventDateLabel = t(
    proposal.eventType === ActivityEventType.Treasury
      ? proposal.transaction?.to === daoAddress
        ? 'received'
        : 'sent'
      : 'created',
  );

  const isSnapshotProposal = !!(proposal as SnapshotProposal).snapshotProposalId;
  const isAzoriusProposal = !!(proposal as AzoriusProposal).votesSummary;

  if (!daoAddress) {
    return null;
  }

  return (
    <Link to={DAO_ROUTES.proposal.relative(addressPrefix, daoAddress, proposal.proposalId)}>
      <Box
        minHeight="6.25rem"
        bg="neutral-2"
        _hover={{ bg: 'neutral-3' }}
        _active={{ bg: 'neutral-2', border: '1px solid', borderColor: 'neutral-3' }}
        transitionDuration="200ms"
        transitionProperty="all"
        transitionTimingFunction="ease-out"
        p="1.5rem"
        borderRadius="0.5rem"
      >
        {/* Top Row */}
        <Flex
          justifyContent="space-between"
          flexWrap="wrap"
          gap="1rem"
        >
          <Flex
            gap={2}
            alignItems="center"
            w={{ base: '100%', md: 'auto' }}
          >
            <Badge
              labelKey={proposal.state!}
              size="sm"
              proposal={proposal}
            />
            {isSnapshotProposal && (
              <Box ml={1}>
                <SnapshotIcon />
              </Box>
            )}
          </Flex>
          {isAzoriusProposal && <QuorumBadge proposal={proposal as AzoriusProposal} />}
        </Flex>
        <ActivityDescription activity={proposal} />
        <Box>
          {proposal.eventDate && (
            <Text
              mt={2}
              textStyle="helper-text-base"
              color="neutral-6"
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
