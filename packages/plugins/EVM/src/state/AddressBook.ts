import { getEnumAsArray } from '@dimensiondev/kit'
import { AddressBookState, Plugin } from '@masknet/plugin-infra'
import { ChainId, formatEthereumAddress, isSameAddress } from '@masknet/web3-shared-evm'

export class AddressBook extends AddressBookState {
    constructor(override context: Plugin.Shared.SharedContext) {
        const defaultValue = getEnumAsArray(ChainId).reduce((accumulator, chainId) => {
            accumulator[chainId.value] = []
            return accumulator
        }, {} as Record<ChainId, string[]>)

        super(context, defaultValue, {
            formatAddress: formatEthereumAddress,
            isSameAddress: isSameAddress,
        })
    }
}
