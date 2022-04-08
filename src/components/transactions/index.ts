import { ContractReceipt, ethers } from 'ethers';
import React, { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useWeb3 } from '../../web3';

interface ProviderRpcError extends Error {
    message: string;
    code: number;
    data?: unknown;
}

export const useTransaction = () => {
    const { chainId } = useWeb3();
    const exploreUrl =
        chainId === 4
            ? 'https://rinkeby.etherscan.io/tx/'
            : chainId === 5
                ? 'https://goerli.etherscan.io/tx/'
                : chainId === 1
                    ? 'https://etherscan.io/tx/'
                    : '';

    const contractCall = useCallback(
        (
            contractFn: () => Promise<ethers.ContractTransaction>,
            pendingMessage: string,
            failedMessage: string,
            successMessage: string,
            stopedCallback?: () => void,
            waitingCallback?: () => void,
            completedCallback?: (txReceipt: ContractReceipt) => void,
            txnHashCallback?: (hash: string) => void
        ) => {
            let toastId: React.ReactText;
            contractFn()
                .then((txResponse: ethers.ContractTransaction) => {
                    toast(
                        pendingMessage,
                    );
                    if (stopedCallback) stopedCallback();
                    return Promise.all([txResponse.wait(), toastId]);
                })
                .then(([txReceipt, toastId]) => {
                    toast.dismiss(toastId);
                    if (txReceipt.status === 0) {
                        toast(failedMessage);
                    } else if (txReceipt.status === 1) {
                        toast(successMessage);
                        if (waitingCallback) waitingCallback();
                    } else {
                        toast(failedMessage);
                    }
                    if (completedCallback) completedCallback(txReceipt);

                    if (txnHashCallback) txnHashCallback(txReceipt.transactionHash);
                    return txReceipt;
                })
                .catch((error: ProviderRpcError) => {
                    if (stopedCallback) stopedCallback();
                    toast.dismiss(toastId);
                    console.error(error);
                    if (error.code !== 4001) {
                        switch (error.code) {
                            case 4100:
                                toast(failedMessage);
                                break;
                            case 4200:
                                toast(failedMessage);
                                break;
                            case 4900:
                                toast(failedMessage);
                                break;
                            case 4901:
                                toast(failedMessage);
                                break;
                        }
                    } else {
                        toast(failedMessage);
                    }
                });
        },
        [exploreUrl]
    );

    return { contractCall };
};