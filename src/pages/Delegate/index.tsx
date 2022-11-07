import { useState } from 'react';
import useDelegateVote from '../../hooks/useDelegateVote';
import useDisplayName from '../../hooks/useDisplayName';
import ContentBox from '../../components/ui/ContentBox';
import ContentBanner from '../../components/ui/ContentBanner';
import EtherscanLinkAddress from '../../components/ui/EtherscanLinkAddress';
import Input from '../../components/ui/forms/Input';
import { PrimaryButton, SecondaryButton } from '../../components/ui/forms/Button';
import InputBox from '../../components/ui/forms/InputBox';
import cx from 'classnames';
import useAddress from '../../hooks/useAddress';
import DataLoadingWrapper from '../../components/ui/loaders/DataLoadingWrapper';
import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../providers/fractal/hooks/useFractal';

export function Delegate() {
  const [newDelegatee, setNewDelegatee] = useState<string>('');
  const { t } = useTranslation(['common', 'dashboard']);
  const [pending, setPending] = useState<boolean>(false);

  const {
    governance: { governanceToken },
  } = useFractal();

  const {
    state: { account },
  } = useWeb3Provider();

  const [, validAddress] = useAddress(newDelegatee);

  const delegateVote = useDelegateVote({
    delegatee: newDelegatee,
    votingTokenContract: governanceToken?.tokenContract,
    setPending: setPending,
  });

  const delegateeDisplayName = useDisplayName(governanceToken?.delegatee);

  const errorMessage = validAddress === false ? t('errorInvalidAddress') : undefined;

  const delegateSelf = () => {
    if (!account) {
      return;
    }

    setNewDelegatee(account);
  };

  if (!governanceToken) return <div>Loading</div>;

  return (
    <>
      <div className="flex flex-col bg-gray-600 my-4 p-2 py-2 rounded-md">
        <ContentBox title={t('titleDelegation', { ns: 'dashboard' })}>
          <InputBox>
            <div className="flex m-2 w-full items-center">
              <Input
                type="text"
                value={newDelegatee}
                disabled={false}
                label={t('newAddress', { ns: 'dashboard' })}
                errorMessage={errorMessage}
                onChange={e => setNewDelegatee(e.target.value)}
              />
              <SecondaryButton
                onClick={() => delegateSelf()}
                label={t('self', { ns: 'dashboard' })}
                className={cx('h-fit -mt-2 sm:mt-auto')}
              />
            </div>
          </InputBox>
          <div className="flex mr-2 my-1 text-gray-50">
            Balance:
            <span className="text-gray-25 ml-2">{governanceToken.userBalanceString}</span>
          </div>
          <div className="flex mr-2 my-1 text-gray-50">
            Current Delegatee:
            <EtherscanLinkAddress address={governanceToken.delegatee}>
              <DataLoadingWrapper isLoading={!delegateeDisplayName}>
                <span className="text-gold-500 ml-2">{delegateeDisplayName}</span>
              </DataLoadingWrapper>
            </EtherscanLinkAddress>
          </div>
          <div className="flex mr-2 my-1 text-gray-50">
            Current Voting Weight:
            <span className="text-gray-25 ml-2">{governanceToken.votingWeightString}</span>
          </div>
          <PrimaryButton
            disabled={!validAddress || newDelegatee.trim() === '' || pending}
            onClick={delegateVote}
            label={t('delegate')}
            className="-ml-0 mt-4"
          />
        </ContentBox>
      </div>
      <div className="">
        <ContentBanner description={t('descriptionDelegation', { ns: 'dashboard' })} />
      </div>
    </>
  );
}

export default Delegate;
