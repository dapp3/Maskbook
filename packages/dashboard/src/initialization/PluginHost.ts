import './plugins'

import i18n from 'i18next'
import { Emitter } from '@servie/events'
import { startPluginDashboard, Plugin } from '@masknet/plugin-infra'
import { createI18NBundle } from '@masknet/shared-base'
import { EVM_RPC } from '@masknet/plugin-evm/src/messages'
import { Services, Messages } from '../API'
import { InMemoryStorages, PersistentStorages } from '../utils/kv-storage'

const PluginHost: Plugin.__Host.Host<Plugin.Dashboard.DashboardContext> = {
    minimalMode: {
        events: new Emitter(),
        isEnabled: (id) => {
            return Services.Settings.getPluginMinimalModeEnabled(id)
        },
    },
    addI18NResource(plugin, resource) {
        createI18NBundle(plugin, resource)(i18n)
    },
    createContext: (pluginID, signal) => {
        return {
            createKVStorage(type, defaultValues) {
                if (type === 'memory') return InMemoryStorages.Plugin.createSubScope(pluginID, defaultValues, signal)
                else return PersistentStorages.Plugin.createSubScope(pluginID, defaultValues, signal)
            },
            openPopupWindow: Services.Helper.openPopupWindow,
            personaSign: Services.Identity.signWithPersona,
            walletSign: EVM_RPC.personalSign,
        }
    },
}
setTimeout(() => {
    Messages.events.pluginMinimalModeChanged.on(([id, status]) => {
        PluginHost.minimalMode.events.emit(status ? 'enabled' : 'disabled', id)
    })
    startPluginDashboard(PluginHost)
})
