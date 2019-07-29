import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        instances: []
    },
    mutations: {
        put (state, data) {
            const instance = data.instance
            const index = data.index
            if (index === undefined || index === null || index >= state.instances.length) {
                state.instances.push(instance)
                window.localStorage.setItem('instances', JSON.stringify(state.instances))
                return
            }
            if (index > -1 && index < state.instances.length) {
                state.instances.splice(index, 1, instance)
                window.localStorage.setItem('instances', JSON.stringify(state.instances))
                return
            }
        },
        remove (state, index) {
            if (index < 0 || index >= state.instances.length) return
            state.instances.splice(index, 1)
            window.localStorage.setItem('instances', JSON.stringify(state.instances))
        },
        init (state) {
            const json = window.localStorage.getItem('instances')
            state.instances = json ? JSON.parse(json) : []
        }
    }
})
