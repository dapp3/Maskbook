import { Trans } from '@lingui/react/macro'
import { RoutePaths } from '@masknet/plugin-redpacket'
import { ElementAnchor, EmptyStatus, LoadingStatus, RestorableScroll, useParamTab } from '@masknet/shared'
import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { Typography } from '@mui/material'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { HistoryTabs } from '../../types.js'
import { RedPacketRecord } from '../components/RedPacketRecord.js'
import { useRedPacket } from '../contexts/RedPacketContext.js'
import { useHandleCreateOrSelect } from '../hooks/useHandleCreateOrSelect.js'
import { useRedPacketHistory } from '../hooks/useRedPacketHistory.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
        padding: theme.spacing(2),
        height: '100%',
        overflow: 'auto',
        scrollbarWidth: 'none',
        boxSizing: 'border-box',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    placeholder: {
        height: 474,
        boxSizing: 'border-box',
    },
}))

const ActionType = FireflyRedPacketAPI.ActionType
export function History() {
    const { classes } = useStyles()
    const [currentHistoryTab] = useParamTab<HistoryTabs>(HistoryTabs.Claimed)
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const actionType = currentHistoryTab === HistoryTabs.Sent ? ActionType.Send : ActionType.Claim

    const {
        data: histories = EMPTY_LIST,
        isLoading,
        fetchNextPage,
        isFetching,
        hasNextPage,
    } = useRedPacketHistory(account, actionType)

    const { creator } = useRedPacket()
    const navigate = useNavigate()
    const onClose = useCallback(() => {
        navigate(RoutePaths.Exit)
    }, [])

    const selectRedPacket = useHandleCreateOrSelect({
        senderName: creator,
        onClose,
    })

    if (isLoading) {
        return <LoadingStatus className={classes.placeholder} />
    }

    if (!histories.length)
        return (
            <EmptyStatus className={classes.placeholder}>
                {currentHistoryTab === HistoryTabs.Claimed ?
                    <Trans>No Lucky Drops claimed</Trans>
                :   <div>
                        <Trans>
                            No Lucky Drops created. Select 🎁 when you compose a post to start your first drop.
                        </Trans>
                    </div>
                }
            </EmptyStatus>
        )

    return (
        <RestorableScroll key={currentHistoryTab} scrollKey={`redpacket-history-${currentHistoryTab}`}>
            <div className={classes.container}>
                {histories.map((history) => (
                    <RedPacketRecord
                        key={history.redpacket_id}
                        history={history as FireflyRedPacketAPI.RedPacketSentInfo}
                        onlyView={currentHistoryTab === HistoryTabs.Claimed}
                        onSelect={selectRedPacket}
                    />
                ))}
                {hasNextPage ?
                    <ElementAnchor height={30} callback={() => fetchNextPage()}>
                        {isFetching ?
                            <LoadingBase />
                        :   null}
                    </ElementAnchor>
                :   <Typography color={(theme) => theme.palette.maskColor.second} textAlign="center" py={2}>
                        <Trans>No more data available.</Trans>
                    </Typography>
                }
            </div>
        </RestorableScroll>
    )
}