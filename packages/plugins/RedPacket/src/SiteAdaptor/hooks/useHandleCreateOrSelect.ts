import { t } from '@lingui/core/macro'
import { ApplicationBoardModal } from '@masknet/shared'
import { RedPacketMetaKey, type NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import type { FireflyRedPacketAPI, RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { useCallback, useContext } from 'react'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { openComposition } from '../openComposition.js'
import { reduceUselessPayloadInfo } from '../utils/reduceUselessPayloadInfo.js'
import { CompositionTypeContext } from '../contexts/CompositionTypeContext.js'

interface Options {
    isFirefly?: boolean
    senderName?: string
    onClose?: () => void
}

export function useHandleCreateOrSelect({ isFirefly, senderName, onClose }: Options) {
    const compositionType = useContext(CompositionTypeContext)
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    return useCallback(
        async (
            payload: RedPacketJSONPayload,
            payloadImage?: string,
            claimRequirements?: FireflyRedPacketAPI.StrategyPayload[],
            publicKey?: string,
        ) => {
            if (payload.password === '') {
                if (payload.contract_version === 1) {
                    // eslint-disable-next-line no-alert
                    alert('Unable to share a lucky drop without a password. But you can still withdraw the lucky drop.')
                    // eslint-disable-next-line no-alert
                    payload.password = prompt('Please enter the password of the lucky drop:', '') ?? ''
                } else if (payload.contract_version > 1 && payload.contract_version < 4) {
                    // just sign out the password if it is lost.
                    payload.password = await EVMWeb3.signMessage(
                        'message',
                        web3_utils.sha3(payload.sender.message) ?? '',
                        {
                            account,
                        },
                    )
                    payload.password = payload.password.slice(2)
                }
            }

            if (!isFirefly && senderName) {
                payload.sender.name === senderName
            }

            const post = t`Hi friends, I just created a token Lucky Drop. Download mask.io to claim. Follow @realMaskNetwork for Web3 updates and insights.

🧧🧧🧧 Try sending Lucky Drop to your friends with Mask io.`
            openComposition(
                RedPacketMetaKey,
                reduceUselessPayloadInfo(payload),
                compositionType,
                {
                    payloadImage,
                    claimRequirements,
                    publicKey,
                },
                post,
            )
            Telemetry.captureEvent(EventType.Access, EventID.EntryAppLuckCreate)
            ApplicationBoardModal.close()
            onClose?.()
        },
        [senderName, onClose, compositionType],
    )
}