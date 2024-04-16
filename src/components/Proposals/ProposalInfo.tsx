import { Box, Flex, Text, Image, Button, Link } from '@chakra-ui/react';
import { Shield } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import useSnapshotProposal from '../../hooks/DAO/loaders/snapshot/useSnapshotProposal';
import { useGetMetadata } from '../../hooks/DAO/proposal/useGetMetadata';
import { useFractal } from '../../providers/App/AppProvider';
import { ExtendedSnapshotProposal, FractalProposal } from '../../types';
import { ActivityDescription } from '../Activity/ActivityDescription';
import Snapshot from '../ui/badges/Snapshot';
import { ModalType } from '../ui/modals/ModalProvider';
import { useFractalModal } from '../ui/modals/useFractalModal';
import ProposalExecutableCode from '../ui/proposal/ProposalExecutableCode';
import ProposalStateBox from '../ui/proposal/ProposalStateBox';

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
    <Box>
      <Flex
        gap={4}
        alignItems="center"
      >
        <ProposalStateBox state={proposal.state} />
        {isSnapshotProposal && (
          <>
            <Snapshot
              snapshotURL={`https://snapshot.org/#${daoSnapshotENS}/proposal/${proposal.proposalId}`}
              mt={0}
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
        />
        {metaData.documentationUrl && (
          <Text
            onClick={confirmUrl}
            color="gold.500"
            as="b"
            cursor="pointer"
          >
            <Flex
              ps="0.5rem"
              pe="0.5rem"
            >
              <Image
                src="/images/external-link.svg"
                alt={''}
                w="1rem"
                h="1rem"
                my={1}
                mr={2}
              />
              {metaData.documentationUrl}
            </Flex>
          </Text>
        )}
        <ProposalExecutableCode proposal={proposal} />
      </Box>
    </Box>
  );
}
