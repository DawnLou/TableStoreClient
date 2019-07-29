<template>
    <div class="container">
        <Button type="primary" icon="md-add" long @click="add">添加实例</Button>
        <div class="instances y-auto">
            <Collapse>
                <Panel v-for="(instance, index) in instances" :key="index" :name="index+''">
                    <a class="instance" @click.stop="remove(index)">
                        <Icon type="ios-trash-outline" :size="iconSize"/>
                    </a>
                    <!--<a class="instance" @click.stop="setting(index)">-->
                        <!--<Icon type="md-settings" :size="iconSize"/>-->
                    <!--</a>-->
                    <a class="instance" @click.stop="listTable(index, instance.conf)">
                        <Icon type="md-refresh" :size="iconSize"/>
                    </a>
                    <!--<Dropdown class="instance">-->
                    <!--<a>-->
                    <!--<Icon type="md-menu" :size="iconSize"/>-->
                    <!--</a>-->
                    <!--<DropdownMenu slot="list">-->
                    <!--<DropdownItem>添加表</DropdownItem>-->
                    <!--</DropdownMenu>-->
                    <!--</Dropdown>-->
                    <span class="instance instance-name">{{instance.conf.instancename}}&nbsp;({{instance.tables?instance.tables.length:0}})</span>
                    <ul slot="content" class="tables y-auto">
                        <li v-for="(table, i) in instance.tables" :key="i">
                            <a @click.stop="openTable(index,table)">{{table}}</a>
                            <!--<a class="opt" @click.stop="describeTable(index,table)">-->
                            <!--<Icon type="ios-more" :size="iconSize"/>-->
                            <!--</a>-->
                            <!--<a class="opt">-->
                            <!--<Icon type="ios-trash-outline" :size="iconSize"/>-->
                            <!--</a>-->
                        </li>
                    </ul>
                </Panel>
            </Collapse>
        </div>
        <InstanceConf ref="confForm" @on-ok="save"/>
    </div>
</template>

<script>
    import InstanceConf from './InstanceConf'
    import {mapState} from 'vuex'

    export default {
        name: "InstanceList",
        components: {InstanceConf},
        data () {
            return {
                iconSize: 20
            }
        },
        computed: mapState({
            instances: state => state.instances
        }),
        methods: {
            add () {
                this.$refs['confForm'].show(this.instances.length)
            },
            save (index, conf) {
                this.listTable(index, conf)
            },
            setting (index) {
                this.$refs['confForm'].show(index, this.instances[index].conf)
            },
            listTable (index, conf) {
                this.$ipc.request('list-table', conf, (err, data) => {
                    if (err) {
                        console.error(err)
                        return
                    }
                    this.$store.commit('put', {index: index, instance: {conf: conf, tables: data.table_names}})
                })
            },
            remove (index) {
                this.$store.commit('remove', index)
            },
            openTable (index, tableName) {
                this.$emit('open-table', tableName, this.instances[index].conf)
            }
        },
        mounted () {
        }
    }
</script>
