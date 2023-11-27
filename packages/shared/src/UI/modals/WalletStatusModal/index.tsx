import { forwardRef, useState } from 'react'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { WalletStatusDialog } from './WalletStatusDialog.js'

export const WalletStatusModal = forwardRef<SingletonModalRefCreator>((props, ref) => {
    const [isHidden, setHidden] = useState(false)

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setHidden(false)
        },
    })

    if (!open) return null
    return <WalletStatusDialog open setHidden={setHidden} onClose={() => dispatch?.close()} isHidden={isHidden} />
})
