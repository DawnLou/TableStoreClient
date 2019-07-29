<template>
    <div class="container">
        <Tabs type="card" v-model="viewIndex" closable :style="{width:'100%',height:'100%'}" @on-tab-remove="close">
            <TableView v-for="(table, i) in tables" :key="i" :table="table"/>
        </Tabs>
    </div>
</template>

<script>
    import TableView from './TableView'

    export default {
        name: "TablesView",
        components: {TableView},
        data () {
            return {
                tables: [],
                viewIndex: 0
            }
        },
        methods: {
            open (name, conf) {
                const len = this.tables.push({name: name, conf: conf})
                this.$nextTick(() => {
                    this.viewIndex = len - 1
                })
            },
            close (i) {
                this.tables.splice(i, 1)
            }
        }
    }
</script>

<style scoped>

</style>
