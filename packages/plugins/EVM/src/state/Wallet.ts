import type { Plugin, Web3Plugin } from '@masknet/plugin-infra'

export class WalletState implements Web3Plugin.ObjectCapabilities.WalletState {
    constructor(private context: Plugin.Shared.SharedContext) {}

    async getAllWallets() {
        return this.context.wallets.getCurrentValue()
    }

    async addWallet(id: string, wallet: Web3Plugin.Wallet) {
        return this.context.addWallet(id, wallet)
    }

    async removeWallet(id: string) {
        return this.context.removeWallet(id)
    }
}
