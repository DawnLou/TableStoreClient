<template>
    <Modal v-model="visible">
        <Form ref="confForm" :model="conf" :rules="rule">
            <FormItem label="instancename" prop="instancename">
                <Input v-model="conf.instancename" placeholder="Enter instancename..."/>
            </FormItem>
            <FormItem label="endpoint" prop="endpoint">
                <Input v-model="conf.endpoint" placeholder="Enter endpoint..."/>
            </FormItem>
            <FormItem label="accessKeyId" prop="accessKeyId">
                <Input v-model="conf.accessKeyId" placeholder="Enter accessKeyId..."/>
            </FormItem>
            <FormItem label="accessKeySecret" prop="accessKeySecret">
                <Input v-model="conf.accessKeySecret" placeholder="Enter accessKeySecret..."/>
            </FormItem>
        </Form>
        <template slot="footer">
            <Button type="text" size="large" @click.native="cancel">取消</Button>
            <Button type="primary" size="large" @click.native="ok">确定</Button>
        </template>
    </Modal>
</template>

<script>
    export default {
        name: "InstanceConf",
        data () {
            return {
                visible: false,
                index: 0,
                conf: {
                    accessKeyId: null,
                    accessKeySecret: null,
                    endpoint: null,
                    instancename: null
                },
                rule: {
                    accessKeyId: [
                        {required: true, message: 'Please enter accessKeyId', trigger: 'blur'}
                    ],
                    accessKeySecret: [
                        {required: true, message: 'Please enter accessKeySecret', trigger: 'blur'}
                    ],
                    endpoint: [
                        {required: true, message: 'Please enter endpoint', trigger: 'blur'}
                    ],
                    instancename: [
                        {required: true, message: 'Please enter instancename', trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            show (index, conf) {
                this.$refs['confForm'].resetFields()
                this.index = index
                if (!conf) {
                    this.conf = {
                        accessKeyId: null,
                        accessKeySecret: null,
                        endpoint: null,
                        instancename: null,
                    }
                } else {
                    this.conf = {
                        accessKeyId: conf.accessKeyId,
                        accessKeySecret: conf.accessKeySecret,
                        endpoint: conf.endpoint,
                        instancename: conf.instancename,
                    }
                }
                this.visible = true
            },
            ok () {
                this.$refs['confForm'].validate(valid => {
                    console.info('valid', valid)
                    if (!valid) return
                    this.$emit('on-ok', this.index, JSON.parse(JSON.stringify(this.conf)))
                    this.visible = false
                })
            },
            cancel () {
                this.visible = false
            }
        }
    }
</script>

<style scoped>

</style>
