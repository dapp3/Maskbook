import { getEnumAsArray } from '@dimensiondev/kit'
import { AccountState, CurrencyType, Plugin } from '@masknet/plugin-infra'
import { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import {
    ChainId,
    ChainOptions,
    getChainIdFromNetworkType,
    getNetworkTypeFromChainId,
    NetworkType,
    ProviderType,
} from '@masknet/web3-shared-evm'

const DEFAULT_CHAIN_OPTINOS: ChainOptions = {
    account: '',
    chainId: ChainId.Mainnet,
    currencyType: CurrencyType.USD,
    networkType: NetworkType.Ethereum,
    providerType: ProviderType.MaskWallet,
}
export class Account extends AccountState<ChainOptions> {
    constructor(override context: Plugin.Shared.SharedContext) {
        const defaultValue = [...getEnumAsArray(EnhanceableSite), ...getEnumAsArray(ExtensionSite)].reduce(
            (accumulator, site) => {
                accumulator[site.value] = DEFAULT_CHAIN_OPTINOS
                return accumulator
            },
            {} as Record<EnhanceableSite | ExtensionSite, ChainOptions>,
        )

        super(context, defaultValue)
    }

    override async updateAccount(site: EnhanceableSite | ExtensionSite, options: Partial<ChainOptions>) {
        if (options.chainId && !options.networkType) options.networkType = getNetworkTypeFromChainId(options.chainId)
        if (!options.chainId && options.networkType) options.chainId = getChainIdFromNetworkType(options.networkType)

        // make sure account and provider type to be updating both
        if ((options.account && !options.providerType) || (options.account === undefined && options.providerType))
            throw new Error('Account and provider type must be updating both.')

        // // update wallet in the DB
        // if (
        //     account &&
        //     providerType &&
        //     EthereumAddress.isValid(account) &&
        //     providerType !== ProviderType.MaskWallet &&
        //     !(await hasWallet(account))
        // ) {
        //     await updateWallet(account, {})
        // }

        await super.updateAccount(site, {
            ...this.storage.storage[site].value,
            ...options,
        })

        // if (providerType === ProviderType.MaskWallet) {
        //     await updateMaskAccount({
        //         account,
        //         chainId,
        //         networkType
        //     })
        // }
    }
}
