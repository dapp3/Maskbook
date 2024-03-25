import { ThemeProvider } from '@emotion/react'
import { MaskLightTheme, PopupSnackbarProvider } from '@masknet/theme'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { memo } from 'react'
import { Route, Routes, HashRouter } from 'react-router-dom'
import SwapPage from './pages/Swap/index.js'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient } from '@masknet/shared-base-ui'
import { queryPersistOptions } from '../shared-ui/index.js'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PageUIProvider } from '@masknet/shared'

const SwapRoutes = memo(function SwapRoutes() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <EVMWeb3ContextProvider>
                        <ThemeProvider theme={MaskLightTheme}>
                            <SwapPage />
                        </ThemeProvider>
                    </EVMWeb3ContextProvider>
                }
            />
        </Routes>
    )
})

const useTheme = () => MaskLightTheme

export default function Swap() {
    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={queryPersistOptions}>
            {process.env.NODE_ENV === 'development' ?
                <ReactQueryDevtools buttonPosition="bottom-right" />
            :   null}
            {PageUIProvider(
                useTheme,
                <PopupSnackbarProvider>
                    <EVMWeb3ContextProvider>
                        <HashRouter>
                            <SwapRoutes />
                        </HashRouter>
                    </EVMWeb3ContextProvider>
                </PopupSnackbarProvider>,
                null,
            )}
        </PersistQueryClientProvider>
    )
}
