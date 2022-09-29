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
import EtherscanLinkAddress from '../../../ui/EtherscanLinkAddress';

type TransactionCardProps = {
  transaction: Transaction;
};

function TransactionCard({ transaction }: TransactionCardProps) {
  const displayAmount = () => {
    const nativeTransaction = transaction as TokenDepositEvent | TokenWithdrawEvent;
    if (nativeTransaction.amount) {
      return `${utils.formatUnits(nativeTransaction.amount)} ETH`;
    }

    const tokenTransaction = transaction as ERC20TokenEvent;
    if (tokenTransaction.amounts) {
      return tokenTransaction.amounts.map((amount: BigNumber) => utils.formatUnits(amount));
    }
  };

  const displayRecipient = () => {
    const nativeDeposit = transaction as TokenDepositEvent;
    if (nativeDeposit.address) {
      return (
        <EtherscanLinkAddress
          address={nativeDeposit.address}
          showENSName
        />
      );
    }
    const nativeWithdraw = transaction as TokenWithdrawEvent;
    if (nativeWithdraw.addresses) {
      return nativeWithdraw.addresses.map(address => (
        <EtherscanLinkAddress
          key={address}
          address={address}
          showENSName
        />
      ));
    }
  };

  return (
    <ContentBox>
      <div className="flex justify-between">
        <p className="text-left text-md text-gray-50">
          {transaction.eventType === TokenEventType.DEPOSIT ? 'Received' : 'Sent'} {displayAmount()}{' '}
          {transaction.eventType === TokenEventType.DEPOSIT ? 'From' : 'To'} {displayRecipient()}
        </p>
        <EtherscanTransactionLink txHash={transaction.transactionHash}>
          View on Etherscan
        </EtherscanTransactionLink>
      </div>
    </ContentBox>
  );
}

export default TransactionCard;
