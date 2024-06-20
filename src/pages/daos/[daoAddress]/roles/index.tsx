import { Box } from '@chakra-ui/react';
import { useFractal } from '../../../../providers/App/AppProvider';

function Roles() {
  const { roles } = useFractal();

  return (
    <Box
      borderColor={'red'}
      borderWidth={1}
    >
      {!roles.hatsTree && <Box>no hat tree :(</Box>}
      {roles.hatsTree && (
        <Box>
          <Box>we have hat tree! {roles.hatsTree.id}</Box>
          <Box>it has {roles.hatsTree.hats ? roles.hatsTree.hats.length : 0} hats</Box>
        </Box>
      )}
    </Box>
  );
}

export default Roles;
