<template>
    <div class="split">
        <Split v-model="split" min="300px">
            <div slot="left" class="split-pane">
                <InstanceList ref="instanceList" @open-table="openTable"/>
            </div>
            <div slot="right" class="split-pane">
                <TablesView ref="tablesView"/>
            </div>
        </Split>
    </div>
</template>

<script>
    import InstanceList from './views/InstanceList'
    import TablesView from './views/TablesView'

    export default {
        name: 'App',
        components: {TablesView, InstanceList},
        data () {
            return {
                split: 0.3
            }
        },
        methods: {
            openTable (name, conf) {
                this.$refs['tablesView'].open(name, conf)
            }
        },
        mounted () {
            this.$store.commit('init')
        }
    }
</script>
