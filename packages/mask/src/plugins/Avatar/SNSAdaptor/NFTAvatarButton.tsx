import { GearSettingsIcon } from '@masknet/icons'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useI18N } from '../../../utils'
import { ApplicationSmallIcon } from '../assets/application'

const useStyles = makeStyles()((theme) => ({
    root: {
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 9999,
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        border: `1px solid ${theme.palette.mode === 'dark' ? '#2F3336' : '#EFF3F4'}`,
        color: theme.palette.text.primary,
        cursor: 'pointer',
    },
    setIcon: {
        width: 14,
        height: 14,
        marginLeft: 2,
    },
    text: {
        display: 'flex',
        alignItems: 'center',
        marginLeft: 4,
    },
}))

interface NFTAvatarButtonProps extends withClasses<'root' | 'text' | 'icon'> {
    onClick: () => void
    showSetting?: boolean
}

export function NFTAvatarButton(props: NFTAvatarButtonProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { onClick } = props
    const { t } = useI18N()

    return (
        <div className={classes.root} onClick={onClick}>
            <ApplicationSmallIcon className={classes.icon} />
            <Typography variant="body1" className={classes.text}>
                <span style={{ marginLeft: 4, fontWeight: 600 }}>{t('nft_avatar')}</span>
                {props.showSetting ? <GearSettingsIcon className={classes.setIcon} /> : null}
            </Typography>
        </div>
    )
}
