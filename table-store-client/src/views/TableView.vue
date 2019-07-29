<template>
    <TabPane :label="table.name + '@' + table.conf.instancename">
        <div class="table-view">
            <div class="table-view-header">
                <div class="float-left">
                    <h2>{{table.name}}</h2>
                </div>
                <div class="float-right">
                    <InputNumber :max="5000" v-model="size" :formatter="fmt"/>
                    <Select v-model="direction" style="width:80px">
                        <Option value="FORWARD">正序</Option>
                        <Option value="BACKWARD">倒序</Option>
                    </Select>
                    <Button icon="md-search" type="primary" @click="search"/>
                    <Button icon="md-search" type="primary" @click="showCondition">高级</Button>
                </div>
            </div>
            <div class="container">
                <div class="table-json-editor-el"></div>
            </div>
            <SearchCondition ref="searchCondition" @on-search="search"/>
        </div>
    </TabPane>
</template>

<script>
    import JsonEditor from 'jsoneditor'
    import SearchCondition from './SearchCondition'

    const pkBuild = (meta, json) => {
        let array = []
        meta.forEach(item => {
            let pk = {}
            const name = item.name
            const val = json ? json[name] : null
            pk[name] = val && val !== "" ? val : null
            array.push(pk)
        })
        return array
    }


    export default {
        name: "TableView",
        components: {SearchCondition},
        props: {table: {type: Object, required: true}},
        data () {
            return {
                size: 50,
                direction: 'FORWARD',
                meta: null,
                rows: [],
                editor: null,
                mode: "form",
                modes: ['code', 'form'],
                searchVisible: false,
            }
        },
        methods: {
            showCondition () {
                this.$refs['searchCondition'].show(this.meta.primary_key)
            },
            fmt (value) {
                return '每页' + value + '条'
            },
            search (_from, _to, direction, limit) {
                const start = pkBuild(this.meta.primary_key, _from)
                const end = pkBuild(this.meta.primary_key, _to)
                const cond = {
                    tableName: this.table.name,
                    direction: direction ? direction : this.direction,
                    start: start,
                    end: end,
                    limit: limit ? limit : this.size
                }
                this.$ipc.request('get-range', {conf: this.table.conf, cond: cond}, (err, data) => {
                    if (err) {
                        console.info('error:', err)
                        return
                    }
                    // console.info('data:', data)
                    this.editor.set(data.rows)
                })
            },
            describe (callback) {
                this.$ipc.request('describe-table', {
                    conf: this.table.conf,
                    tableName: this.table.name
                }, (err, data) => {
                    if (err) {
                        console.error(err)
                        return
                    }
                    // console.info(data.table_meta)
                    this.meta = data.table_meta
                    if (callback) callback()
                })
            }
        },
        mounted () {
            if (!this.editor) {
                this.editor = new JsonEditor(this.$el.querySelector('.table-json-editor-el'), {
                    mode: this.mode,
                    modes: this.modes
                })
            }
            this.describe(() => {
                this.$nextTick(() => {
                    this.search()
                })
            })
        }
    }
</script>

<style scoped>

</style>
