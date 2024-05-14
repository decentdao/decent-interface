import { Box, Flex, Button, Link } from '@chakra-ui/react';
import { Shield } from '@decent-org/fractal-ui';
import { ArrowUpRight } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import useSnapshotProposal from '../../hooks/DAO/loaders/snapshot/useSnapshotProposal';
import { useGetMetadata } from '../../hooks/DAO/proposal/useGetMetadata';
import { useFractal } from '../../providers/App/AppProvider';
import { ExtendedSnapshotProposal, FractalProposal } from '../../types';
import { ActivityDescription } from '../Activity/ActivityDescription';
import { Badge } from '../ui/badges/Badge';
import { SnapshotButton } from '../ui/badges/Snapshot';
import { ModalType } from '../ui/modals/ModalProvider';
import { useFractalModal } from '../ui/modals/useFractalModal';
import ProposalExecutableCode from '../ui/proposal/ProposalExecutableCode';
import CeleryButtonWithIcon from '../ui/utils/CeleryButtonWithIcon';

export function ProposalInfo({
  proposal,
}: {
  proposal: FractalProposal | ExtendedSnapshotProposal;
}) {
  const metaData = useGetMetadata(proposal);
  const { t } = useTranslation('proposal');
  const {
    node: { daoSnapshotENS },
  } = useFractal();
  const { isSnapshotProposal } = useSnapshotProposal(proposal);

  const confirmUrl = useFractalModal(ModalType.CONFIRM_URL, { url: metaData.documentationUrl });

  return (
    <Box
      borderRadius={8}
      border="1px solid"
      borderColor="neutral-3"
      padding="1.5rem"
    >
      <Flex
        gap={4}
        alignItems="center"
      >
        {proposal.state && (
          <Badge
            size="base"
            labelKey={proposal.state}
            proposal={proposal}
          />
        )}
        {isSnapshotProposal && (
          <>
            <SnapshotButton snapshotENS={`${daoSnapshotENS}/proposal/${proposal.proposalId}`} />
            {(proposal as ExtendedSnapshotProposal).privacy === 'shutter' && (
              <Button
                as={Link}
                target="_blank"
                href="https://blog.shutter.network/announcing-shutter-governance-shielded-voting-for-daos/"
                variant="secondary"
                h={6}
                w={32}
              >
                <Shield
                  width="16px"
                  height="16px"
                  mr={1}
                />
                {t('shutterPrivacy')}
              </Button>
            )}
          </>
        )}
      </Flex>
      <Box mt={4}>
        <ActivityDescription
          activity={proposal}
          showFullDescription
          showAuthor={false}
        />
        {metaData.documentationUrl && (
          <CeleryButtonWithIcon
            iconPosition="end"
            icon={ArrowUpRight}
            onClick={confirmUrl}
            text={metaData.documentationUrl}
          />
        )}
        <ProposalExecutableCode proposal={proposal} />
      </Box>
    </Box>
  );
}
