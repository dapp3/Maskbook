import type { Plugin, Web3Plugin } from '@masknet/plugin-infra'
import type { ScopedStorage } from '@masknet/shared-base'

export class NameServiceState implements Web3Plugin.ObjectCapabilities.NameServiceState {
    protected storage: ScopedStorage<Record<number, Record<string, string>>> = null!

    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected defaultValue: Record<number, Record<string, string>>,
        protected options: {
            isValidName(a: string): boolean
            isValidAddress(a: string): boolean
            formatAddress(a: string): string
        },
    ) {
        this.storage = context.createKVStorage('memory', defaultValue)
    }

    async addName(chainId: number, address: string, name: string) {
        if (!this.options.isValidAddress(address)) return
        await this.storage.storage[chainId].setValue({
            ...this.storage.storage[chainId].value,
            [this.options.formatAddress(address)]: name,
        })
    }

    async addAddress(chainId: number, name: string, address: string) {
        if (!this.options.isValidAddress(address)) return
        await this.storage.storage[chainId].setValue({
            ...this.storage.storage[chainId].value,
            [name]: this.options.formatAddress(address),
        })
    }

    async lookup(chainId: number, name: string) {
        const address = this.storage.storage[chainId].value[name]
        if (!this.options.isValidAddress(address)) return
        return address
    }

    async reverse(chainId: number, address: string) {
        if (!this.options.isValidAddress(address)) return
        return this.storage.storage[chainId].value[this.options.formatAddress(address)]
    }
}
