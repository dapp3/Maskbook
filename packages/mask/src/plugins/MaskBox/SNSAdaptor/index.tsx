import { useMemo } from 'react'
import { Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra'
import { base } from '../base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { parseURL } from '@masknet/shared-base'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { PreviewCard } from './components/PreviewCard'
import { Context } from '../hooks/useContext'
import { ApplicationEntry } from '@masknet/shared'
import { openWindow } from '@masknet/shared-base-ui'
import { CrossBridgeIcon, MaskBoxIcon } from '@masknet/icons'

const isMaskBox = (x: string) => x.startsWith('https://box-beta.mask.io') || x.startsWith('https://box.mask.io')

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector(props) {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURL(x.val).find(isMaskBox)
        }, [props.message])
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component() {
        const link = usePostInfoDetails.mentionedLinks().find(isMaskBox)
        if (!link) return null
        return <Renderer url={link} />
    },
    ApplicationEntries: [
        {
            RenderEntryComponent({ disabled, AppIcon }) {
                return (
                    <ApplicationEntry
                        title="Cross-chain"
                        disabled={disabled}
                        AppIcon={AppIcon}
                        onClick={() => openWindow('https://bridge.mask.io/#/')}
                    />
                )
            },
            defaultSortingPriority: 5,
            AppIcon: <CrossBridgeIcon />,
            name: 'Cross-chain',
        },
        {
            RenderEntryComponent({ disabled, AppIcon }) {
                return (
                    <ApplicationEntry
                        title="MaskBox"
                        disabled={disabled}
                        AppIcon={AppIcon}
                        onClick={() => openWindow('https://box.mask.io/#/')}
                    />
                )
            },
            defaultSortingPriority: 6,
            AppIcon: <MaskBoxIcon />,
            description: 'Professional multi-chain decentralized platform for launching NFT mystery boxes.',
            isInDappList: true,
            name: 'MaskBox',
        },
    ],
}

export default sns

function Renderer(props: React.PropsWithChildren<{ url: string }>) {
    const [, chainId] = props.url.match(/chain=(\d+)/i) ?? []
    const [, boxId] = props.url.match(/box=(\d+)/i) ?? []
    const [, hashRoot] = props.url.match(/rootHash=([\dA-Za-z]+)/) ?? []

    const shouldNotRender = !chainId || !boxId
    usePluginWrapper(!shouldNotRender)
    if (shouldNotRender) return null

    return (
        <EthereumChainBoundary chainId={Number.parseInt(chainId, 10)}>
            <Context.Provider initialState={{ boxId, hashRoot }}>
                <PreviewCard />
            </Context.Provider>
        </EthereumChainBoundary>
    )
}
