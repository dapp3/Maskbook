import type { Plugin, Web3Plugin } from '@masknet/plugin-infra'
import {
    AddressBookState,
    AssetState,
    NameServiceState,
    AccountState,
    SharedState,
    TokenListState,
    TokenState,
    TransactionState,
    UtilState,
} from '../../../state'

export async function createWeb3State(
    signal: AbortSignal,
    context: Plugin.SNSAdaptor.SNSAdaptorContext,
): Promise<Web3Plugin.ObjectCapabilities.Capabilities> {
    return {
        Account: new AccountState(),
        AddressBook: new AddressBookState(),
        Asset: new AssetState(),
        NameService: new NameServiceState(),
        Token: new TokenState(),
        TokenList: new TokenListState(),
        Transaction: new TransactionState(),
        Shared: await new SharedState().create(),
        Utils: await new UtilState().create(),
    }
}
