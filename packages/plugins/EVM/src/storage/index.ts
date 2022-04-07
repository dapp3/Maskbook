import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import { CurrencyType } from '@masknet/plugin-infra'
import { EMPTY_LIST, EMPTY_OBJECT, EnhanceableSite, ExtensionSite, ScopedStorage } from '@masknet/shared-base'
import { ChainId, NetworkType, ProviderType, ChainOptions } from '@masknet/web3-shared-evm'
import type { MemoryStorage, PersistentStorage } from '../types'

export const MemoryDefaultValue: MemoryStorage = {
    chainOptions: [...getEnumAsArray(EnhanceableSite), ...getEnumAsArray(ExtensionSite)].reduce((accumulator, site) => {
        accumulator[site.value] = {
            chainId: ChainId.Mainnet,
            account: '',
            providerType: ProviderType.MaskWallet,
            networkType: NetworkType.Ethereum,
            currencyType: CurrencyType.USD,
        }
        return accumulator
    }, EMPTY_OBJECT as Record<EnhanceableSite | ExtensionSite, ChainOptions>),
    gasOptions: null,
    addressBook: EMPTY_OBJECT,
    domainBook: EMPTY_OBJECT,
    tokenPrices: EMPTY_OBJECT,
}

export const PersistentDefaultValue: PersistentStorage = {
    transactions: EMPTY_OBJECT,
    fungibleTokens: EMPTY_LIST,
    nonFungibleTokens: EMPTY_LIST,
    fungibleTokenBlockedBy: EMPTY_OBJECT,
    nonFungibleTokenBlockedBy: EMPTY_OBJECT,
}

const storage: {
    memory: ScopedStorage<typeof MemoryDefaultValue>
    persistent: ScopedStorage<typeof PersistentDefaultValue>
} = {
    memory: null!,
    persistent: null!,
}

export function setupStorage<
    T extends 'memory' | 'persistent',
    S extends T extends 'memory' ? MemoryStorage : PersistentStorage,
>(type: T, _: ScopedStorage<S>) {
    // @ts-ignore
    storage[type] = _
}

export function getStorageSubscription<
    T extends 'memory' | 'persistent',
    N extends T extends 'memory' ? keyof MemoryStorage : keyof PersistentStorage,
    V extends N extends keyof MemoryStorage
        ? MemoryStorage[N]
        : N extends keyof PersistentStorage
        ? PersistentStorage[N]
        : never,
>(type: T, name: N): Subscription<V> {
    // @ts-ignore
    return storage[type].storage[name].subscription
}

export async function getStorageValue<
    T extends 'memory' | 'persistent',
    N extends T extends 'memory' ? keyof MemoryStorage : keyof PersistentStorage,
    V extends N extends keyof MemoryStorage
        ? MemoryStorage[N]
        : N extends keyof PersistentStorage
        ? PersistentStorage[N]
        : never,
>(type: T, name: N): Promise<V> {
    // @ts-ignore
    return storage[type].storage[name]
}

export async function setStorageValue<
    T extends 'memory' | 'persistent',
    N extends T extends 'memory' ? keyof MemoryStorage : keyof PersistentStorage,
    V extends N extends keyof MemoryStorage
        ? MemoryStorage[N]
        : N extends keyof PersistentStorage
        ? PersistentStorage[N]
        : never,
>(type: T, name: N, value: V): Promise<void> {
    // @ts-ignore
    await storage[type].storage[name].setValue(value)
}
