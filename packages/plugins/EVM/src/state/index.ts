import type { RequestArguments, TransactionConfig } from 'web3-core'
import type { Plugin, Web3Plugin } from '@masknet/plugin-infra'
import type { EthereumTransactionConfig } from '@masknet/web3-shared-evm'
import {AddressBookState} from './AddressBook'
import {AssetState} from './Asset'
import {AccountState} from './Account'
import {TokenState} from './Token'
import {TokenListState} from './TokenList'
import {TransactionState} from './Transaction'
import {NameServiceState} from './NameService'
import {ProtocolState} from './Protocol'
import {WalletState} from './Wallet'
import {SharedState} from './Shared'
import {UtilState} from './Utils'

export type State = Web3Plugin.ObjectCapabilities.Capabilities<EthereumTransactionConfig, RequestArguments, TransactionConfig>

let state: State | null = null

export async function setupState(context: Plugin.SNSAdaptor.SNSAdaptorContext) {
    state = {
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
    return state
}

export function getState() {
    if (!state) throw new Error('Please setup state at first.')
    return state
}

export async function setState(newState: State) {
    state = newState
}
