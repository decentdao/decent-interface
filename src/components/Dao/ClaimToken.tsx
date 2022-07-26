import { useState } from 'react';
import ContentBox from '../ui/ContentBox';
import { PrimaryButton } from '../ui/forms/Button';
import { useDAOData } from '../../contexts/daoData';

function ClaimToken() {
  const [pending, setPending] = useState<boolean>(false);
  const [claimAmount, setClaimAmount] = useState<string>('1000.0');

  const [
    {
      modules: {
        governor: {
          votingToken: {
            votingTokenData: { decimals, symbol, userBalance, delegatee, votingWeight },
          },
        },
      },
    },
  ] = useDAOData();

  // const claimToken = useClaimToken({
  //   setPending,
  // });

  return (
    <ContentBox isLightBackground>
      <div className="flex justify-between items-center">
        <div className="text-gray-25">
          {`You have ${claimAmount} ${symbol} available to claim!`}
        </div>
        <PrimaryButton
          label="Claim"
          className="mr-0"
          onClick={() => console.log('Claiming')}
          disabled={pending}
        />
      </div>
    </ContentBox>
  );
}

export default ClaimToken;
