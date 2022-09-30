import { BigNumber, utils } from 'ethers';
import { Transaction } from '../../../../controller/Modules/injectors/TreasuryInjectorContext';
import {
  ERC20TokenEvent,
  TokenDepositEvent,
  TokenWithdrawEvent,
  TokenEventType,
} from '../../../../providers/treasury/types';
import ContentBox from '../../../ui/ContentBox';
import EtherscanTransactionLink from '../../../ui/EtherscanTransactionLink';
import EtherscanDisplayNameLink from '../../../ui/EtherscanDisplayNameLink';
import { useTranslation } from 'react-i18next';

type TransactionCardProps = {
  transaction: Transaction;
};

function TransactionCard({ transaction }: TransactionCardProps) {
  const { t } = useTranslation();

  const displayAmount = () => {
    const nativeTransaction = transaction as TokenDepositEvent | TokenWithdrawEvent;
    if (nativeTransaction.amount) {
      return t('ethAmount', { amount: utils.formatUnits(nativeTransaction.amount) });
    }

    const tokenTransaction = transaction as ERC20TokenEvent;
    if (tokenTransaction.amounts) {
      return tokenTransaction.amounts.map((amount: BigNumber) => utils.formatUnits(amount));
    }
  };

  const displayRecipient = () => {
    const nativeDeposit = transaction as TokenDepositEvent;
    if (nativeDeposit.address) {
      return <EtherscanDisplayNameLink address={nativeDeposit.address} />;
    }
    const nativeWithdraw = transaction as TokenWithdrawEvent;
    if (nativeWithdraw.addresses) {
      return nativeWithdraw.addresses.map(address => (
        <EtherscanDisplayNameLink
          key={address}
          address={address}
        />
      ));
    }
  };

  return (
    <ContentBox>
      <div className="flex justify-between">
        <p className="text-left text-md text-gray-50">
          {transaction.eventType === TokenEventType.DEPOSIT ? t('received') : t('sent')}{' '}
          {displayAmount()} {transaction.eventType === TokenEventType.DEPOSIT ? t('from') : t('to')}{' '}
          {displayRecipient()}
        </p>
        <EtherscanTransactionLink txHash={transaction.transactionHash}>
          View on Etherscan
        </EtherscanTransactionLink>
      </div>
    </ContentBox>
  );
}

export default TransactionCard;
