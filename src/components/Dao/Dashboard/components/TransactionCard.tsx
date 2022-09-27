import { BigNumber, utils } from 'ethers';
import { Transaction } from '../../../../controller/Modules/injectors/TreasuryInjectorContext';
import { createAccountSubstring } from '../../../../hooks/useDisplayName';
import {
  ERC20TokenEvent,
  TokenDepositEvent,
  TokenWithdrawEvent,
  TokenEventType,
} from '../../../../providers/treasury/types';
import ContentBox from '../../../ui/ContentBox';
import EtherscanTransactionLink from '../../../ui/EtherscanTransactionLink';

type TransactionCardProps = {
  transaction: Transaction;
};

function TransactionCard({ transaction }: TransactionCardProps) {
  const showAmount = () => {
    const nativeTransaction = transaction as TokenDepositEvent | TokenWithdrawEvent;
    if (nativeTransaction.amount) {
      return `${utils.formatUnits(nativeTransaction.amount)} ETH`;
    }

    const tokenTransaction = transaction as ERC20TokenEvent;
    if (tokenTransaction.amounts) {
      return tokenTransaction.amounts.map((amount: BigNumber) => utils.formatUnits(amount));
    }
  };

  const showRecipient = () => {
    const nativeDeposit = transaction as TokenDepositEvent;
    if (nativeDeposit.address) {
      return createAccountSubstring(nativeDeposit.address);
    }
    const nativeWithdraw = transaction as TokenWithdrawEvent;
    if (nativeWithdraw.addresses) {
      return nativeWithdraw.addresses.map(address => createAccountSubstring(address));
    }
  };

  return (
    <ContentBox>
      <div className="flex justify-between">
        <p className="text-left text-md text-gray-50">
          {transaction.eventType === TokenEventType.DEPOSIT ? 'Received' : 'Sent'} {showAmount()}{' '}
          {transaction.eventType === TokenEventType.DEPOSIT ? 'From' : 'To'} {showRecipient()}
        </p>
        <EtherscanTransactionLink txHash={transaction.transactionHash}>
          View on Etherscan
        </EtherscanTransactionLink>
      </div>
    </ContentBox>
  );
}

export default TransactionCard;
