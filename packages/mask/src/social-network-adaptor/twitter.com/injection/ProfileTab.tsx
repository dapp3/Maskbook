import Color from 'color'
import { useEffect, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed, startWatch, untilElementAvailable, MaskMessages } from '../../../utils/index.js'
import {
    searchAppBarBackSelector,
    searchNewTweetButtonSelector,
    searchProfileEmptySelector,
    searchProfileTabListLastChildSelector,
    searchProfileTabListSelector,
    searchProfileTabPageSelector,
    searchProfileTabSelector,
    searchProfileTabLoseConnectionPageSelector,
    searchNameTag,
} from '../utils/selector.js'
import { ProfileTab } from '../../../components/InjectedComponents/ProfileTab.js'

function getStyleProps() {
    const EMPTY_STYLE = {} as CSSStyleDeclaration
    const tab = searchProfileTabSelector().evaluate()
    const tabStyle = tab ? getComputedStyle(tab) : EMPTY_STYLE
    const eleTab = tab?.querySelector<Element>('div')
    const eleLabel = tab?.querySelector<Element>('span')
    const style = eleTab ? window.getComputedStyle(eleTab) : EMPTY_STYLE
    const labelStyle = eleLabel ? window.getComputedStyle(eleLabel) : EMPTY_STYLE
    const eleNewTweetButton = searchNewTweetButtonSelector().evaluate()
    const newTweetButtonColorStyle = eleNewTweetButton ? window.getComputedStyle(eleNewTweetButton) : EMPTY_STYLE
    const eleBackButton = searchAppBarBackSelector().evaluate()
    const backButtonColorStyle = eleBackButton ? window.getComputedStyle(eleBackButton) : EMPTY_STYLE

    return {
        color: labelStyle.color,
        font: labelStyle.font,
        fontSize: labelStyle.fontSize,
        padding: style.paddingBottom,
        paddingX: tabStyle.paddingLeft || '16px',
        height: tabStyle.height || '53px',
        hover: backButtonColorStyle.color,
        line: newTweetButtonColorStyle.backgroundColor,
    }
}

const useStyles = makeStyles()((theme) => {
    const props = getStyleProps()

    return {
        root: {
            '&:hover': {
                backgroundColor: new Color(props.hover).alpha(0.1).toString(),
                cursor: 'pointer',
            },
            height: props.height,
        },
        button: {
            zIndex: 1,
            position: 'relative',
            display: 'flex',
            minWidth: 56,
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            paddingLeft: props.paddingX,
            paddingRight: props.paddingX,
            color: props.color,
            font: props.font,
            fontSize: props.fontSize,
            fontWeight: 500,
            '&:hover': {
                color: props.color,
            },
            height: props.height,
        },
        selected: {
            color: `${props.hover} !important`,
            fontWeight: 700,
        },
        line: {
            borderRadius: 9999,
            position: 'absolute',
            bottom: 0,
            minWidth: 56,
            alignSelf: 'center',
            height: 4,
            backgroundColor: props.line,
        },
    }
})

function nameTagClickHandler() {
    MaskMessages.events.profileTabUpdated.sendToLocal({ show: false })
    MaskMessages.events.profileTabActive.sendToLocal({ active: false })
    const nameTag = searchNameTag().evaluate()
    if (nameTag) nameTag.style.display = ''

    const eleEmpty = searchProfileEmptySelector().evaluate()
    if (eleEmpty) eleEmpty.style.display = 'none'

    const elePage = searchProfileTabPageSelector().evaluate()
    if (elePage) {
        elePage.style.visibility = 'hidden'
        elePage.style.height = 'auto'
    }
}

function tabClickHandler() {
    MaskMessages.events.profileTabUpdated.sendToLocal({ show: false })
    MaskMessages.events.profileTabActive.sendToLocal({ active: false })

    resetTwitterActivatedContent()
}

async function hideTwitterActivatedContent() {
    const eleTab = searchProfileTabSelector().evaluate()?.querySelector('div') as Element
    const loseConnectionEle = searchProfileTabLoseConnectionPageSelector().evaluate()
    if (!eleTab) return
    const style = window.getComputedStyle(eleTab)

    // hide the activated indicator
    const tabList = searchProfileTabListSelector().evaluate()
    tabList.map((tab) => {
        const container = tab.querySelector<HTMLDivElement>('div')
        if (container) container.style.color = style.color

        const divList = tab.querySelectorAll<HTMLDivElement>('div')
        for (const div of divList) {
            if (getComputedStyle(div).height === '4px') {
                div.style.visibility = 'hidden'
                break
            }
        }
        tab.addEventListener('click', tab.closest('#open-nft-button') ? nameTagClickHandler : tabClickHandler)
    })

    if (loseConnectionEle) return

    // hide the empty list indicator on the page
    const eleEmpty = searchProfileEmptySelector().evaluate()
    if (eleEmpty) eleEmpty.style.display = 'none'

    const nameTag = searchNameTag().evaluate()
    if (nameTag) nameTag.style.display = 'none'

    // hide the content page
    await untilElementAvailable(searchProfileTabPageSelector())

    const elePage = searchProfileTabPageSelector().evaluate()
    if (elePage) {
        elePage.style.visibility = 'hidden'
        elePage.style.height = 'auto'
    }
}

function resetTwitterActivatedContent() {
    const eleTab = searchProfileTabSelector().evaluate()?.querySelector<Element>('div')
    const loseConnectionEle = searchProfileTabLoseConnectionPageSelector().evaluate()
    if (!eleTab) return

    const tabList = searchProfileTabListSelector().evaluate()
    tabList.map((tab) => {
        const container = tab.querySelector<HTMLDivElement>('div')
        if (container) container.style.color = ''

        const divList = tab.querySelectorAll<HTMLDivElement>('div')
        for (const div of divList) {
            if (getComputedStyle(div).height === '4px') {
                div.style.visibility = ''
                break
            }
        }
        tab.removeEventListener('click', tab.closest('#open-nft-button') ? nameTagClickHandler : tabClickHandler)
    })

    if (loseConnectionEle) return

    const eleEmpty = searchProfileEmptySelector().evaluate()
    if (eleEmpty) eleEmpty.style.display = ''

    const elePage = searchProfileTabPageSelector().evaluate()
    if (elePage) {
        elePage.style.visibility = 'visible'
        elePage.style.height = 'auto'
    }
}

export function ProfileTabAtTwitter() {
    const { classes } = useStyles()
    const [hidden, setHidden] = useState(false)
    useEffect(() => {
        return MaskMessages.events.profileTabHidden.on((data) => {
            setHidden(data.hidden)
        })
    }, [])

    return hidden ? null : (
        <ProfileTab
            title="Web3"
            classes={{
                root: classes.root,
                button: classes.button,
                selected: classes.selected,
            }}
            reset={resetTwitterActivatedContent}
            clear={hideTwitterActivatedContent}
            children={<div className={classes.line} />}
        />
    )
}

export function injectProfileTabAtTwitter(signal: AbortSignal) {
    let tabInjected = false
    const contentWatcher = new MutationObserverWatcher(searchProfileTabPageSelector()).useForeach(() => {
        const elePage = searchProfileTabPageSelector().evaluate()
        if (elePage && !tabInjected) {
            const watcher = new MutationObserverWatcher(searchProfileTabListLastChildSelector())
            startWatch(watcher, signal)
            createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<ProfileTabAtTwitter />)
            tabInjected = true
        }
    })

    startWatch(contentWatcher, signal)
}
