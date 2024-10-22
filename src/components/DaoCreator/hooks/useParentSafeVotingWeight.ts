import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import { useFractal } from '../../../providers/App/AppProvider';
import { AzoriusGovernance, GovernanceType } from '../../../types/fractal';

export const useParentSafeVotingWeight = () => {
  const {
    node: { safe },
    governance,
    readOnly: { dao },
  } = useFractal();

  const [parentVotingQuorum, setParentVotingQuorum] = useState<bigint>();
  const [totalParentVotingWeight, setTotalParentVotingWeight] = useState<bigint>();

  useEffect(() => {
    if (!safe) {
      return;
    }

    switch (governance.type) {
      case GovernanceType.AZORIUS_ERC20:
      case GovernanceType.AZORIUS_ERC20_HATS_WHITELISTING:
      case GovernanceType.AZORIUS_ERC721:
      case GovernanceType.AZORIUS_ERC721_HATS_WHITELISTING:
        const governanceAzorius = governance as AzoriusGovernance;

        if (dao?.isAzorius === false || !governanceAzorius.votingStrategy) {
          return;
        }

        // Setup Azorius parent total voting weight
        if (governanceAzorius.votesToken) {
          const totalSupplyFormatted = formatUnits(
            governanceAzorius.votesToken.totalSupply,
            governanceAzorius.votesToken.decimals,
          );

          if (totalSupplyFormatted.indexOf('.') === -1) {
            setTotalParentVotingWeight(BigInt(totalSupplyFormatted));
          } else {
            const supplyWithoutDecimals = totalSupplyFormatted.substring(
              0,
              totalSupplyFormatted.indexOf('.'),
            );
            setTotalParentVotingWeight(BigInt(supplyWithoutDecimals));
          }
        } else if (governanceAzorius.erc721Tokens) {
          const totalVotingWeight = governanceAzorius.erc721Tokens.reduce(
            (prev, curr) => curr.votingWeight * (curr.totalSupply || 1n) + prev,
            0n,
          );

          setTotalParentVotingWeight(totalVotingWeight);
        }

        // Setup Azorius parent voting quorum
        const quorumThreshold =
          governanceAzorius.votingStrategy.quorumThreshold?.value ||
          governanceAzorius.votingStrategy.quorumPercentage?.value;
        if (!quorumThreshold) {
          throw new Error('Parent voting quorum is undefined');
        }
        setParentVotingQuorum(quorumThreshold);

        break;

      case GovernanceType.MULTISIG:
        setTotalParentVotingWeight(BigInt(safe.owners.length));
        setParentVotingQuorum(BigInt(safe.threshold));
    }
  }, [safe, governance, dao]);

  return {
    totalParentVotingWeight,
    parentVotingQuorum,
  };
};
