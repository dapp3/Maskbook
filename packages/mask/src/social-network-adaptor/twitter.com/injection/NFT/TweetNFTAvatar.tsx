import { DOMProxy, type LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed, startWatch } from '../../../../utils/index.js'
import { getInjectNodeInfo } from '../../utils/avatar.js'
import { searchRetweetAvatarSelector, searchTweetAvatarSelector } from '../../utils/selector.js'
import { noop } from 'lodash-es'
import { MiniAvatarBorder } from './MiniAvatarBorder.js'
import { activatedSocialNetworkUI } from '../../../../social-network/ui.js'

function _(main: () => LiveSelector<HTMLElement>, signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(main()).useForeach((ele, _, meta) => {
            let remover = noop
            const remove = () => remover()

            const run = async () => {
                const info = getInjectNodeInfo(ele.firstChild as HTMLElement)
                if (!info) return

                const proxy = DOMProxy({ afterShadowRootInit: { mode: process.env.shadowRootMode } })
                proxy.realCurrent = info.element.firstChild as HTMLElement
                const root = createReactRootShadowed(proxy.afterShadow, { untilVisible: true, signal })
                root.render(
                    <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
                        <MiniAvatarBorder
                            avatarType={info.avatarType}
                            size={info.width}
                            screenName={
                                activatedSocialNetworkUI.collecting.identityProvider?.recognized.value.identifier
                                    ?.userId || ''
                            }
                        />
                    </div>,
                )
                remover = root.destroy
            }

            run()
            return {
                onNodeMutation: run,
                onTargetChanged: run,
                onRemove: remove,
            }
        }),
        signal,
    )
}

export async function injectUserNFTAvatarAtTweet(signal: AbortSignal) {
    _(searchTweetAvatarSelector, signal)
    _(searchRetweetAvatarSelector, signal)
}
