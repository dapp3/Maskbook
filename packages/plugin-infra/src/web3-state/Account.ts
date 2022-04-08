import type { Web3Plugin, Plugin } from '@masknet/plugin-infra'
import type { EnhanceableSite, ExtensionSite, ScopedStorage } from '@masknet/shared-base'

export class AccountState<T> implements Web3Plugin.ObjectCapabilities.AccountState<T> {
    protected storage: ScopedStorage<Record<EnhanceableSite | ExtensionSite, T>> = null!

    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected defaultValue: Record<EnhanceableSite | ExtensionSite, T>,
    ) {
        this.storage = this.context.createKVStorage('memory', defaultValue)
    }

    async getAccount(site: EnhanceableSite | ExtensionSite) {
        return this.storage.storage[site].value
    }

    async updateAccount(site: EnhanceableSite | ExtensionSite, options: Partial<T>) {
        await this.storage.storage[site].setValue({
            ...this.storage.storage[site].value,
            ...options,
        })
    }

    async resetAccount(site: EnhanceableSite | ExtensionSite) {
        await this.updateAccount(site, this.defaultValue[site])
    }
}
