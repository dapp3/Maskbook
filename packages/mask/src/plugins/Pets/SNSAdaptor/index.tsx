import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import AnimatePic from './Animate'
import { PetDialog } from './PetDialog'
import { PluginPetMessages } from '../messages'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ApplicationEntry } from '@masknet/shared'
import { LootManIcon } from '@masknet/icons'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init() {},
    GlobalInjection() {
        return (
            <>
                <AnimatePic />
                <PetDialog />
            </>
        )
    },
    ApplicationEntries: [
        {
            RenderEntryComponent({ disabled, AppIcon }) {
                const { openDialog } = useRemoteControlledDialog(PluginPetMessages.events.essayDialogUpdated)

                return (
                    <ApplicationEntry
                        disabled={disabled}
                        title="Non-F Friends"
                        AppIcon={AppIcon}
                        onClick={openDialog}
                    />
                )
            },
            appBoardSortingDefaultPriority: 11,
            marketListSortingPriority: 12,
            AppIcon: <LootManIcon />,
            description: 'Explore the endless possibilities of NFTs.',
            name: 'Non-F Friends',
            tutorialLink: 'https://twitter.com/mintteamnft?s=21',
            isInDappList: true,
        },
    ],
}

export default sns
