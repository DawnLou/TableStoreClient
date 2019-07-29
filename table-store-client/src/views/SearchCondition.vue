<template>
    <Modal v-model="visible" width="400px">
        <Form>
            <FormItem label="起始" :error="startError">
                <Input v-model="start"/>
            </FormItem>
            <FormItem label="结束" :error="endError">
                <Input v-model="end"/>
            </FormItem>
        </Form>
        <template slot="footer">
            <InputNumber :max="5000" v-model="size" :formatter="fmt"/>
            <Select v-model="direction" style="width:80px">
                <Option value="FORWARD">正序</Option>
                <Option value="BACKWARD">倒序</Option>
            </Select>
            <Button icon="md-search" type="primary" @click="search"/>
        </template>
    </Modal>
</template>

<script>
    export default {
        name: "SearchCondition",
        data () {
            return {
                visible: false,
                start: '',
                startError: '',
                endError: '',
                end: '',
                size: 50,
                direction: 'FORWARD',
            }
        },
        methods: {
            fmt (value) {
                return '每页' + value + '条'
            },
            show (meta) {
                this.startError = ''
                this.endError = ''
                let template = {}
                meta.forEach(item => {
                    const name = item.name
                    template[name] = ""
                })
                const json = JSON.stringify(template)
                this.start = json
                this.end = json
                this.visible = true
            },
            search () {
                let start = null
                let end = null
                try {
                    start = JSON.parse(this.start)
                } catch (e) {
                    this.startError = e.message
                    return
                }
                try {
                    end = JSON.parse(this.end)
                } catch (e) {
                    this.endError = e.message
                    return
                }
                this.$emit('on-search', start, end, this.direction, this.size)
                this.visible = false
            }
        }
    }
</script>

<style scoped>

</style>
