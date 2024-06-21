import { Box } from '@chakra-ui/react';
import { useFractal } from '../../../../providers/App/AppProvider';

function CreateNewHatsTree() {
  return (
    <Box mb="1rem">
      <Box fontSize={'larger'}>Create New Hats Tree</Box>
    </Box>
  );
}

function Roles() {
  const { roles } = useFractal();

  return (
    <Box my="1rem">
      <Box fontSize={'larger'}>Hat Tree</Box>
      {roles.hatsTree === undefined && <Box>Searching for Hats Tree...</Box>}
      {roles.hatsTree === null && (
        <>
          <Box mb="1rem">No Hats Tree exists for this Safe yet :(</Box>
          <CreateNewHatsTree />
        </>
      )}
      {roles.hatsTree && (
        <Box>
          <Box>We have a Hats Tree! {roles.hatsTree.id}</Box>
          <Box>it has {roles.hatsTree.hats ? roles.hatsTree.hats.length : 0} hats</Box>
        </Box>
      )}
    </Box>
  );
}

export default Roles;
