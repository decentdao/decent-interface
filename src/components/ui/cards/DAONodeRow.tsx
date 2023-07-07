import { Flex } from '@chakra-ui/react';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { useFractal } from '../../../providers/App/AppProvider';
import { NodeLineHorizontal } from '../../pages/DaoHierarchy/NodeLines';
import { DAOInfoCard, InfoProps } from './DAOInfoCard';

interface Props extends InfoProps {
  depth: number;
}

export const NODE_HEIGHT_REM = 6.75;
export const NODE_MARGIN_TOP_REM = 1;

/**
 * A DAO row within the DAO hierarchy, which displays the DAOInfoCard
 * and the horizontal line, as well as adding left margin to indent
 * the DAO info card, depending on the depth of the DAO.
 */
export function DAONodeRow(props: Props) {
  const {
    node: { daoAddress: currentDAOAddress }, // used ONLY to determine if we're on the current DAO
  } = useFractal();

  const isCurrentDAO = props.node?.daoAddress === currentDAOAddress;
  const border = isCurrentDAO ? { border: '1px solid', borderColor: 'drab.500' } : undefined;

  return (
    <Flex
      minH={NODE_HEIGHT_REM + 'rem'}
      mt={NODE_MARGIN_TOP_REM + 'rem'}
      bg={BACKGROUND_SEMI_TRANSPARENT}
      p="1rem"
      borderRadius="0.5rem"
      flex={1}
      position="relative"
      {...border}
    >
      <NodeLineHorizontal
        isCurrentDAO={isCurrentDAO}
        isFirstChild={props.depth === 0 && props.parentAddress !== currentDAOAddress}
      />
      <DAOInfoCard
        parentAddress={props.parentAddress}
        node={props.node}
        freezeGuard={props.freezeGuard}
        guardContracts={props.guardContracts}
      />
    </Flex>
  );
}
