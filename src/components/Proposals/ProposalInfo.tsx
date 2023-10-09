import { Box, Flex, Text, Image } from '@chakra-ui/react';
import useSnapshotProposal from '../../hooks/DAO/loaders/snapshot/useSnapshotProposal';
import { useGetMetadata } from '../../hooks/DAO/proposal/useGetMetadata';
import { FractalProposal } from '../../types';
import { ActivityDescription } from '../Activity/ActivityDescription';
import { ModalType } from '../ui/modals/ModalProvider';
import { useFractalModal } from '../ui/modals/useFractalModal';
import ProposalExecutableCode from '../ui/proposal/ProposalExecutableCode';
import ProposalStateBox from '../ui/proposal/ProposalStateBox';

export function ProposalInfo({ proposal }: { proposal: FractalProposal }) {
  const metaData = useGetMetadata(proposal);
  const { isSnapshotProposal } = useSnapshotProposal(proposal);

  const confirmUrl = useFractalModal(ModalType.CONFIRM_URL, { url: metaData.documentationUrl });

  return (
    <Box>
      <Flex
        gap={4}
        alignItems="center"
      >
        <ProposalStateBox state={proposal.state} />
      </Flex>
      <Box mt={4}>
        <ActivityDescription
          activity={proposal}
          showFullSnapshotDescription
        />
        {!isSnapshotProposal && <Text my={4}>{metaData.description}</Text>}
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
