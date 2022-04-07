import type { Web3Plugin } from '@masknet/plugin-infra'
import type { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import type {
    ChainOptions,
    CryptoPrice,
    EthereumRPC_Computed,
    EthereumTransactionConfig,
    GasOptions,
} from '@masknet/web3-shared-evm'

export interface MemoryStorage {
    /** cached chain options depend on currently visiting site */
    chainOptions: Record<EnhanceableSite | ExtensionSite, ChainOptions>
    /** cached gas options */
    gasOptions: GasOptions | null
    /** list of address */
    addressBook: Web3Plugin.AddressBook
    /** cached domain names and addresses */
    domainBook: Web3Plugin.DomainBook
    /** cached token prices */
    tokenPrices: CryptoPrice
}

export interface PersistentStorage {
    /** list of transactions owned by accounts */
    transactions: {
        /** chain id + account */
        [key in string]?: (Web3Plugin.RecentTransaction & {
            /** list of transactions that race at the time */
            candidates: Record<string, EthereumTransactionConfig>
            /** computed ethereum RPC */
            computedPayload?: EthereumRPC_Computed
        })[]
    }
    /** list of fungible tokens */
    fungibleTokens: Web3Plugin.FungibleToken[]
    /** list of non-fungible tokens */
    nonFungibleTokens: Web3Plugin.NonFungibleToken[]
    /** a token address maps to a set of wallet address */
    fungibleTokenBlockedBy: Web3Plugin.AddressList
    /** a token address maps to a set of wallet address */
    nonFungibleTokenBlockedBy: Web3Plugin.AddressList
}
