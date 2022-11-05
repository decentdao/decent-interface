import { ethers } from 'ethers';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useClaimToken from '../../hooks/useClaimToken';
import { useGovenorModule } from '../../providers/govenor/hooks/useGovenorModule';
import ContentBox from '../ui/ContentBox';
import { PrimaryButton } from '../ui/forms/Button';

function ClaimToken() {
  const [pending, setPending] = useState<boolean>(false);
  const { t } = useTranslation('dashboard');

  const {
    votingToken: {
      votingTokenData: { decimals, symbol, userClaimAmount },
    },
  } = useGovenorModule();

  const claimToken = useClaimToken({
    setPending,
  });

  const formattedValue = useMemo(
    () =>
      userClaimAmount && decimals
        ? ethers.utils.formatUnits(userClaimAmount.toString(), decimals)
        : undefined,
    [userClaimAmount, decimals]
  );

  if (!formattedValue || !Number(formattedValue)) {
    return null;
  }

  return (
    <ContentBox isLightBackground>
      <div className="flex justify-between items-center">
        <div className="text-gray-25">
          {t('labelClaimTokens', { value: formattedValue, symbol: symbol })}
        </div>
        <PrimaryButton
          label={t('claim')}
          className="mr-0"
          onClick={claimToken}
          disabled={pending}
        />
      </div>
    </ContentBox>
  );
}

export default ClaimToken;
