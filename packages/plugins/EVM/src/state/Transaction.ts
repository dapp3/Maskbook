import { TransactionStatusType, Web3Plugin } from '@masknet/plugin-infra'
import { ChainId, EthereumTransactionConfig, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { getStorageValue, setStorageValue } from '../storage'

export class TransactionState implements Web3Plugin.ObjectCapabilities.TransactionState<EthereumTransactionConfig> {
    static MAX_RECORD_SIZE = 20

    private getRecordKey(chainId: ChainId, address: string) {
        return `${chainId}_${formatEthereumAddress(address)}`
    }

    private currySameTransaction(id: string, negative = false) {
        return (transaction: { candidates: Record<string, EthereumTransactionConfig> }) => {
            const included = Object.keys(transaction.candidates).includes(id)
            return negative ? !included : included
        }
    }

    async getTransaction(chainId: ChainId, address: string, id: string) {
        const transactions = await this.getAllTransactions(chainId, address)
        return transactions.find(this.currySameTransaction(id)) ?? null
    }

    async getAllTransactions(chainId: ChainId, address: string) {
        const key = this.getRecordKey(chainId, address)
        const transactions = await getStorageValue('persistent', 'transactions')
        return transactions[key] ?? []
    }

    async addTransaction(chainId: ChainId, address: string, id: string, config: EthereumTransactionConfig) {
        const now = new Date()
        const key = this.getRecordKey(chainId, address)
        const all = await getStorageValue('persistent', 'transactions')

        // to ensure that the transaction doesn't exist
        const transaction = all[key]?.find(this.currySameTransaction(id))
        if (transaction) return

        await setStorageValue('persistent', 'transactions', {
            ...all,
            [key]: [
                // new records go first then we will remove it last
                {
                    chainId,
                    id,
                    createdAt: now,
                    updatedAt: now,
                    status: TransactionStatusType.NOT_DEPEND,
                    candidates: {
                        [id]: config as EthereumTransactionConfig,
                    },
                },
                ...(all[key] ?? []),
            ].slice(0, TransactionState.MAX_RECORD_SIZE),
        })

        // EVM message
    }

    async replaceTransaction(
        chainId: ChainId,
        address: string,
        id: string,
        newId: string,
        config: EthereumTransactionConfig,
    ) {
        const now = new Date()
        const key = this.getRecordKey(chainId, address)
        const all = await getStorageValue('persistent', 'transactions')

        // to ensure that the transaction exists
        const transaction = all[key]?.find(this.currySameTransaction(id))
        if (!transaction) return

        // update the transaction in place
        transaction.candidates[newId] = config as EthereumTransactionConfig
        transaction.updatedAt = now

        await setStorageValue('persistent', 'transactions', all)

        // EVM message
    }

    async updateTransaction(
        chainId: ChainId,
        address: string,
        id: string,
        status: Exclude<TransactionStatusType, TransactionStatusType.NOT_DEPEND>,
    ) {
        const now = new Date()
        const key = this.getRecordKey(chainId, address)
        const all = await getStorageValue('persistent', 'transactions')

        // to ensure that the transaction exists
        const transaction = all[key]?.find(this.currySameTransaction(id))
        if (!transaction) return

        // update the transaction in place
        transaction.status = status
        transaction.updatedAt = now

        await setStorageValue('persistent', 'transactions', all)

        // EVM message
    }

    async removeTransaction(chainId: ChainId, address: string, id: string) {
        const key = this.getRecordKey(chainId, address)
        const all = await getStorageValue('persistent', 'transactions')

        await setStorageValue('persistent', 'transactions', {
            ...all,
            [key]: all[key]?.filter(this.currySameTransaction(id, true)),
        })
    }

    async clearTransactions(chainId: ChainId, address: string) {
        const key = this.getRecordKey(chainId, address)
        const all = await getStorageValue('persistent', 'transactions')

        await setStorageValue('persistent', 'transactions', {
            ...all,
            [key]: [],
        })
    }
}
