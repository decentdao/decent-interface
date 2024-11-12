import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { SquaresFour } from '@phosphor-icons/react';
import { useFractal } from '../../providers/App/AppProvider';
import { EditBadgeStatus } from '../../types/roles';
import { SendAssetsAction } from '../ProposalBuilder/ProposalActionCard';
import { RoleCardShort } from '../Roles/RoleCard';

export function DemoProposalActions() {
  const {
    treasury: { assetsFungible },
  } = useFractal();

  return (
    <Box
      maxW="736px"
      my="2rem"
    >
      <Flex
        mt={4}
        mb={2}
        alignItems="center"
      >
        <Icon
          as={SquaresFour}
          w="1.5rem"
          h="1.5rem"
        />
        <Text
          textStyle="display-lg"
          ml={2}
        >
          Actions
        </Text>
      </Flex>
      <RoleCardShort
        key={0}
        name={'Role: Delegate 3'}
        handleRoleClick={() => {}}
        editStatus={EditBadgeStatus.New}
      />
      <SendAssetsAction
        action={{
          destinationAddress: '0xeb54d471CFadb8a9fD114C4628c89620b313432f',
          transferAmount: 2000_000000000000000000n,
          asset: assetsFungible[0],
          nonceInput: undefined,
        }}
        key={1}
        index={1}
      />
    </Box>
  );
}
