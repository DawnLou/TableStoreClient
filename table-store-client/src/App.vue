<template>
  <div class="split">
    <Split v-model="split" min="300px">
      <div slot="left" class="split-pane">
        <InstanceList ref="instanceList" @open-table="openTable" @on-dump="dump"/>
      </div>
      <div slot="right" class="split-pane">
        <TablesView ref="tablesView"/>
      </div>
    </Split>
    <DumpModel ref="dumpModel"></DumpModel>
  </div>
</template>

<script>
  import InstanceList from './views/InstanceList'
  import TablesView from './views/TablesView'
  import DumpModel from './views/DumpModel';

  export default {
    name: 'App',
    components: {DumpModel, TablesView, InstanceList},
    data() {
      return {
        split: 0.3
      }
    },
    methods: {
      openTable(name, conf) {
        this.$refs['tablesView'].open(name, conf)
      },
      dump(instance) {
        // console.info(instance);
        this.$refs.dumpModel.show(instance);
      }
    },
    mounted() {
      this.$store.commit('init')
    }
  }
</script>
