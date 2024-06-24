import { Box } from '@chakra-ui/react';
import { useRolesState } from '../../../../state/useRolesState';

function Roles() {
  const { hatsTree } = useRolesState();

  return (
    <Box my="1rem">
      <Box fontSize={'larger'}>Hat Tree</Box>
      {hatsTree === undefined && <Box>Searching for Hats Tree...</Box>}
      {hatsTree === null && <Box>No Hats Tree exists for this Safe yet :(</Box>}
      {hatsTree && (
        <Box>
          <Box>We have a Hats Tree! {hatsTree.id}</Box>
          <Box>It has {hatsTree.hats ? hatsTree.hats.length : 0} Hats</Box>
        </Box>
      )}
    </Box>
  );
}

export default Roles;
