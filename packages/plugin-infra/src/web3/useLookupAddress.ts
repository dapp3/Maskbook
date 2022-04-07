import { useChainId, useWeb3State } from '.'
import { useAsync } from 'react-use'
import type { NetworkPluginID } from '../web3-types'

export function useLookupAddress(domain: string, pluginId?: NetworkPluginID) {
    const { NameService, Utils } = useWeb3State(pluginId)
    const chainId = useChainId(pluginId)

    return useAsync(async () => {
        return Utils?.isValidDomain?.(domain) ? NameService?.lookup?.(chainId, domain) : undefined
    }, [NameService, Utils, domain, chainId])
}
