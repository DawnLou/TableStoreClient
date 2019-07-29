import {ipcRenderer} from 'electron'

export default {
    install (Vue) {
        Vue.prototype.$logger = {
            info () {
                ipcRenderer.send('info', ...arguments)
            },
            debug () {
                ipcRenderer.send('debug', ...arguments)
            },
            warn () {
                ipcRenderer.send('warn', ...arguments)
            },
            error () {
                ipcRenderer.send('error', ...arguments)
            }
        }
    }
}
