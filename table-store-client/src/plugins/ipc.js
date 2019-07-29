import {ipcRenderer} from 'electron'
import uuid from 'uuid'
import iView from 'iview'


export default {
    install (Vue) {
        Vue.prototype.$ipc = {
            sendSync (channel, data) {
                return ipcRenderer.sendSync(channel, data)
            },
            send (channel, data) {
                ipcRenderer.send(channel, data)
            },
            listen (channel, listener) {
                ipcRenderer.on(channel, listener)
            },
            once (channel, listener) {
                ipcRenderer.once(channel, listener)
            },
            request (channel, data, callback) {
                const reply = uuid.v1()
                ipcRenderer.once(reply, (event, err, data) => {
                    if (err) {
                        iView.Modal.error({
                            title: '出错了',
                            render: (h) => {
                                return h('ErrorView', {
                                    props: {value: err}
                                })
                            }
                        })
                        // return
                    }
                    callback(err, data)
                })
                ipcRenderer.send(channel, {replyChannel: reply, data: data})
            }
        }
    }
}
