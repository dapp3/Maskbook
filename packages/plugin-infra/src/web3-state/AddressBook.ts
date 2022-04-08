import { uniqBy } from 'lodash-unified'
import type { Plugin, Web3Plugin } from '@masknet/plugin-infra'
import type { ScopedStorage } from '@masknet/shared-base'

export class AddressBookState implements Web3Plugin.ObjectCapabilities.AddressBookState {
    protected storage: ScopedStorage<Record<number, string[]>> = null!

    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected defaultValue: Record<number, string[]>,
        protected options: {
            isSameAddress(a: string, b: string): boolean
            formatAddress(a: string): string
        },
    ) {
        this.storage = this.context.createKVStorage('persistent', defaultValue)
    }

    async addAddress(chainId: number, address: string) {
        await this.storage.storage[chainId].setValue(
            uniqBy([...this.storage.storage[chainId].value, this.options.formatAddress(address)], (x) =>
                x.toLowerCase(),
            ),
        )
    }
    async removeAddress(chainId: number, address: string) {
        await this.storage.storage[chainId].setValue(
            this.storage.storage[chainId].value.filter((x) => this.options.isSameAddress(x, address)),
        )
    }
}
