import { useState } from 'react';
import ContentBox from '../ui/ContentBox';
import { PrimaryButton } from '../ui/forms/Button';
import { useDAOData } from '../../contexts/daoData';
import useClaimToken from '../../hooks/useClaimToken';
import { ethers } from 'ethers';

function ClaimToken() {
  const [pending, setPending] = useState<boolean>(false);

  const [
    {
      modules: {
        governor: {
          votingToken: {
            votingTokenData: { decimals, symbol, userClaimAmount },
          },
        },
      },
    },
  ] = useDAOData();

  const claimToken = useClaimToken({
    setPending,
  });

  if (userClaimAmount === undefined || userClaimAmount.eq(0)) {
    return null;
  }

  return (
    <ContentBox isLightBackground>
      <div className="flex justify-between items-center">
        <div className="text-gray-25">
          {`You have ${ethers.utils.formatUnits(
            userClaimAmount.toString(),
            decimals
          )} ${symbol} available to claim!`}
        </div>
        <PrimaryButton
          label="Claim"
          className="mr-0"
          onClick={claimToken}
          disabled={pending}
        />
      </div>
    </ContentBox>
  );
}

export default ClaimToken;
