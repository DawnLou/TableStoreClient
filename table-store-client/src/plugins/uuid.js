import uuid from 'uuid'

export default {
    install (Vue) {
        Vue.prototype.$uuid = () => {
            return uuid.v1()
        }
    }
}
