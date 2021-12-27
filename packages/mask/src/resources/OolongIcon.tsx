import { SvgIconProps, SvgIcon } from '@mui/material'

const svg = (
    // todo add oolongswap svg logo
    <svg width="26" height="26" viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient x1="4.518%" y1="-4.373%" x2="100%" y2="100%" id="dodo_gradient">
                <stop stopColor="#FFFC2C" offset="0%" />
                <stop stopColor="#EFE806" offset="100%" />
            </linearGradient>
        </defs>
        <g fill="none" fillRule="evenodd">
            <circle fill="url(#dodo_gradient)" cx="25" cy="25" r="25" />
            <path
                d="M25.434 8c1.135 0 2.055 1.677 2.055 3.745 0 .05 0 .1-.002.15.61-.747 1.32-1.116 1.863-.88.552.24.787 1.046.675 2.038-.027.47-.14.987-.345 1.504-.12.3-.26.578-.416.827C37.353 17.236 43.089 24.09 42.999 36h-4.923c.076-10.096-5.609-15.081-13.048-15.238-8.101-.17-12.585 5.391-13.105 15.238H7c.63-11.961 5.641-19.249 14.443-20.682-.14-.21-.4-.636-.516-.884-.69-1.478-.592-2.999.22-3.398.648-.32 1.555.176 2.246 1.143a6.829 6.829 0 01-.014-.434c0-2.068.92-3.745 2.055-3.745zm-4.496 18.575c.594 0 1.075.55 1.075 1.23v3.022c0 .679-.481 1.23-1.075 1.23-.593 0-1.074-.551-1.074-1.23v-3.022c0-.68.48-1.23 1.074-1.23zm8.595 0c.593 0 1.074.55 1.074 1.23v3.022c0 .679-.481 1.23-1.074 1.23-.594 0-1.075-.551-1.075-1.23v-3.022c0-.68.481-1.23 1.075-1.23z"
                fill="#000"
            />
        </g>
    </svg>
)

export function OolongIcon(props: SvgIconProps) {
    return <SvgIcon {...props}>{svg}</SvgIcon>
}
