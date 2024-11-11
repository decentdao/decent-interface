import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield } from '../../assets/theme/custom/icons/Shield';
import useSnapshotProposal from '../../hooks/DAO/loaders/snapshot/useSnapshotProposal';
import { useGetMetadata } from '../../hooks/DAO/proposal/useGetMetadata';
import { useFractal } from '../../providers/App/AppProvider';
import { ExtendedSnapshotProposal, FractalProposal, FractalProposalState } from '../../types';
import { ActivityDescription } from '../Activity/ActivityDescription';
import { Badge } from '../ui/badges/Badge';
import { SnapshotButton } from '../ui/badges/Snapshot';
import { ModalType } from '../ui/modals/ModalProvider';
import { useDecentModal } from '../ui/modals/useDecentModal';
import { ProposalCountdown } from '../ui/proposal/ProposalCountdown';
import ProposalExecutableCode from '../ui/proposal/ProposalExecutableCode';
import CeleryButtonWithIcon from '../ui/utils/CeleryButtonWithIcon';
import { DemoProposalActions } from './DemoProposalActions';

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
  const { snapshotProposal } = useSnapshotProposal(proposal);

  const [modalType, props] = useMemo(() => {
    if (!metaData.documentationUrl) {
      return [ModalType.NONE] as const;
    }
    return [
      ModalType.CONFIRM_URL,
      {
        url: metaData.documentationUrl,
      },
    ] as const;
  }, [metaData.documentationUrl]);

  const confirmUrl = useDecentModal(modalType, props);

  return (
    <Box
      borderRadius={8}
      border="1px solid"
      borderColor="neutral-3"
      padding="1.5rem"
    >
      <Flex
        gap={2}
        alignItems="center"
      >
        {/* Simulate expired proposal for demo */}
        {proposal.state && (
          <Badge
            size="base"
            labelKey={
              proposal.transactionHash ===
              '0xb6066f0979c96a1d56d5d6bae3bf6d2a04707ebf84bcc0d84b15c9eff4759173'
                ? FractalProposalState.EXPIRED
                : proposal.state
            }
          />
        )}
        <ProposalCountdown
          proposal={proposal}
          showIcon={false}
          textColor="neutral-7"
        />
        {snapshotProposal && (
          <>
            <SnapshotButton
              snapshotENS={`${daoSnapshotENS}/proposal/${snapshotProposal.proposalId}`}
            />
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
        {proposal.transactionHash ===
          '0x642672a027d13d31ef366dcd18a4cd89d2ef7b67b22c41b9cff91c2306b4b964' && (
          <DemoProposalActions />
        )}
        <ProposalExecutableCode proposal={proposal} />
      </Box>
    </Box>
  );
}
