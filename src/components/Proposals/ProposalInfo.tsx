import { Box, Button, Flex, Text, Image } from '@chakra-ui/react';
import { useGetMetadata } from '../../hooks/DAO/proposal/useGetMetadata';
import { FractalProposal } from '../../types';
import { ActivityDescription } from '../Activity/ActivityDescription';
import { ModalType } from '../ui/modals/ModalProvider';
import { useFractalModal } from '../ui/modals/useFractalModal';
import ProposalExecutableCode from '../ui/proposal/ProposalExecutableCode';
import ProposalStateBox from '../ui/proposal/ProposalStateBox';

export function ProposalInfo({ proposal }: { proposal: FractalProposal }) {
  const metaData = useGetMetadata(proposal);

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
        <ActivityDescription activity={proposal} />
        <Text my={4}>{metaData.description}</Text>
        {metaData.documentationUrl && (
          <Button
            onClick={confirmUrl}
            variant="text"
            color="gold.500"
          >
            <Flex>
              <Image
                src="/images/external-link.svg"
                alt={'Test'}
                w="1rem"
                h="1rem"
                my={1}
                mr={2}
              />
              {metaData.documentationUrl}
            </Flex>
          </Button>
        )}
        <ProposalExecutableCode proposal={proposal} />
      </Box>
    </Box>
  );
}
