import { useEffect, useState } from 'react';
import { utils } from 'ethers';
import useDelegateVote from '../../hooks/useDelegateVote';
import useDisplayName from '../../hooks/useDisplayName';
import ContentBox from '../ui/ContentBox';
import ContentBanner from '../../components/ui/ContentBanner';
import EtherscanLinkAddress from '../ui/EtherscanLinkAddress';
import Input from '../ui/forms/Input';
import { SecondaryButton } from '../ui/forms/Button';
import InputBox from '../ui/forms/InputBox';
import cx from 'classnames';
import useAddress from '../../hooks/useAddress';
import DataLoadingWrapper from '../ui/loaders/DataLoadingWrapper';
import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';
import { useGovenorModule } from '../../providers/govenor/hooks/useGovenorModule';

function Delegate() {
  const [newDelegatee, setNewDelegatee] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    state: { account },
  } = useWeb3Provider();
  const [, validAddress] = useAddress(newDelegatee);
  const {
    votingToken: {
      votingTokenData: { decimals, symbol, userBalance, delegatee, votingWeight },
    },
  } = useGovenorModule();
  const delegateeDisplayName = useDisplayName(delegatee);

  const delegateSelf = () => {
    if (!account) {
      return;
    }

    setNewDelegatee(account);
  };

  const [delegateVote, pending] = useDelegateVote({
    delegatee: newDelegatee,
    successCallback: () => setNewDelegatee(''),
  });

  const [readableBalance, setReadableBalance] = useState<string>();
  useEffect(() => {
    if (userBalance === undefined || decimals === undefined || symbol === undefined) {
      setReadableBalance(undefined);
      return;
    }

    setReadableBalance(`${utils.formatUnits(userBalance, decimals)} ${symbol}`);
  }, [decimals, userBalance, symbol]);

  const [readableVotingWeight, setReadableVotingWeight] = useState<string>();

  useEffect(() => {
    if (votingWeight === undefined || decimals === undefined || symbol === undefined) {
      setReadableVotingWeight(undefined);
      return;
    }

    setReadableVotingWeight(`${utils.formatUnits(votingWeight, decimals)} ${symbol}`);
  }, [decimals, votingWeight, symbol]);

  useEffect(() => {
    if (validAddress === false) {
      setErrorMessage('Invalid address');
    } else {
      setErrorMessage('');
    }
  }, [validAddress]);
  return (
    <>
      <div className="flex flex-col bg-gray-600 my-4 p-2 py-2 rounded-md">
        <ContentBox title="Delegate Vote">
          <InputBox>
            <div className="flex m-2 w-full items-center">
              <Input
                type="text"
                value={newDelegatee}
                disabled={false}
                label="New Delegate Address"
                errorMessage={errorMessage}
                onChange={e => setNewDelegatee(e.target.value)}
              />
              <SecondaryButton
                onClick={() => delegateSelf()}
                label="Self"
                className={cx('h-fit -mt-2 sm:mt-0')}
              />
            </div>
          </InputBox>
          <div className="flex mr-2 my-1 text-gray-50">
            Balance:{' '}
            <span className="text-gray-25 ml-2">
              <DataLoadingWrapper isLoading={readableBalance === undefined}>
                {readableBalance}
              </DataLoadingWrapper>
            </span>
          </div>
          <div className="flex mr-2 my-1 text-gray-50">
            Current Delegatee:{' '}
            <EtherscanLinkAddress address={delegatee}>
              <DataLoadingWrapper isLoading={!delegateeDisplayName}>
                <span className="text-gold-500 ml-2">{delegateeDisplayName}</span>
              </DataLoadingWrapper>
            </EtherscanLinkAddress>
          </div>
          <div className="flex mr-2 my-1 text-gray-50">
            Current Voting Weight:{' '}
            <span className="text-gray-25 ml-2">
              <DataLoadingWrapper isLoading={readableVotingWeight === undefined}>
                {readableVotingWeight}
              </DataLoadingWrapper>
            </span>
          </div>
          <SecondaryButton
            disabled={!validAddress || newDelegatee.trim() === '' || pending}
            onClick={() => delegateVote()}
            label="Delegate"
            className="-ml-0 mt-4"
          />
        </ContentBox>
      </div>
      <div className="">
        <ContentBanner
          description={
            'Enter the address to delegate your vote to. Click "Self" to assign yourself.'
          }
        />
      </div>
    </>
  );
}

export default Delegate;
