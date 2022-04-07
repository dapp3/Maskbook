import { Web3Plugin, CurrencyType } from '@masknet/plugin-infra'
import { ChainId, NetworkType, ProviderType, ChainOptions } from '@masknet/web3-shared-evm'
import { Mask } from '@masknet/web3-providers'
import { createConstantSubscription, getSiteType, mapSubscription, mergeSubscription } from '@masknet/shared-base'
import { getStorageSubscription } from '../storage'

export class SharedState {
    private createSubscriptionFromChainOptions<T>(getter: (value: ChainOptions | undefined) => T) {
        const siteType = getSiteType()
        return mapSubscription(getStorageSubscription('memory', 'chainOptions'), (chainOptions) =>
            getter(siteType ? chainOptions[siteType] : undefined),
        )
    }

    async create(): Promise<Web3Plugin.ObjectCapabilities.SharedState> {
        const chainId = this.createSubscriptionFromChainOptions(
            (chainOptions) => chainOptions?.chainId ?? ChainId.Mainnet,
        )
        const account = this.createSubscriptionFromChainOptions((chainOptions) => chainOptions?.account ?? '')

        return {
            allowTestnet: createConstantSubscription(process.env.NODE_ENV === 'development'),
            chainId,
            account,
            networkType: this.createSubscriptionFromChainOptions(
                (chainOptions) => chainOptions?.networkType ?? NetworkType.Ethereum,
            ),
            providerType: this.createSubscriptionFromChainOptions(
                (chainOptions) => chainOptions?.providerType ?? ProviderType.MaskWallet,
            ),
            currencyType: this.createSubscriptionFromChainOptions(
                (chainOptions) => chainOptions?.currencyType ?? CurrencyType.USD,
            ),

            addressBook: mapSubscription(
                mergeSubscription<[ChainId, Web3Plugin.AddressBook]>(
                    chainId,
                    getStorageSubscription('memory', 'addressBook'),
                ),
                ([chainId, addressBook]) => addressBook[chainId] ?? [],
            ),
            domainBook: mapSubscription(
                mergeSubscription<[ChainId, Web3Plugin.DomainBook]>(
                    chainId,
                    getStorageSubscription('memory', 'domainBook'),
                ),
                ([chainId, domainBook]) => domainBook[chainId] ?? {},
            ),

            // prices: mapSubscription(getStorageSubscription('memory', 'tokenPrices'), (x) => x),

            // wallets: mapSubscription(getStorageSubscription('persistent', 'wallets'), (x) => x),
            // walletPrimary: mapSubscription(
            //     getStorageSubscription('persistent', 'wallets'),
            //     (x) => x.find((x) => x.storedKeyInfo?.type === Mask.StoredKeyType.Mnemonic) ?? null,
            // ),

            fungibleTokens: mapSubscription(
                mergeSubscription<[string, Web3Plugin.FungibleToken[], Web3Plugin.AddressList]>(
                    account,
                    getStorageSubscription('persistent', 'fungibleTokens'),
                    getStorageSubscription('persistent', 'fungibleTokenBlockedBy'),
                ),
                ([account, tokens, blocked]) => tokens.filter((x) => !blocked[account]?.includes(x.address)),
            ),

            nonFungibleTokens: mapSubscription(
                mergeSubscription<[string, Web3Plugin.NonFungibleToken[], Web3Plugin.AddressList]>(
                    account,
                    getStorageSubscription('persistent', 'nonFungibleTokens'),
                    getStorageSubscription('persistent', 'nonFungibleTokenBlockedBy'),
                ),
                ([account, tokens, blocked]) => tokens.filter((x) => !blocked[account]?.includes(x.address)),
            ),
        }
    }
}
