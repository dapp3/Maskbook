import type { Plugin, Web3Plugin } from '@masknet/plugin-infra'
import type { EthereumTransactionConfig } from '@masknet/web3-shared-evm'
import type { RequestArguments, TransactionConfig } from 'web3-core'
import {
    AddressBookState,
    AssetState,
    NameServiceState,
    AccountState,
    TokenListState,
    TokenState,
    TransactionState,
    ProtocolState,
    SharedState,
    UtilState,
    WalletState,
} from '../../../state'

export async function createWeb3State(
    signal: AbortSignal,
    context: Plugin.SNSAdaptor.SNSAdaptorContext,
): Promise<Web3Plugin.ObjectCapabilities.Capabilities<EthereumTransactionConfig, RequestArguments, TransactionConfig>> {
    return {
        Account: new AccountState(),
        AddressBook: new AddressBookState(),
        Asset: new AssetState(),
        NameService: new NameServiceState(),
        Token: new TokenState(),
        TokenList: new TokenListState(),
        Transaction: new TransactionState(),
        Protocol: new ProtocolState(context),
        Wallet: new WalletState(context),
        Shared: await new SharedState().create(),
        Utils: await new UtilState().create(),
    }
}
