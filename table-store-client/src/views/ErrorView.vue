<template>
    <div>
        <a @click="visible = true">查看详情</a>
        <Modal v-model="visible" footer-hide fullscreen>
            <div class="error-view-el">
                [CODE]:{{value.code}}&nbsp;{{value.message}}<br/>
                {{value.stack}}
            </div>
        </Modal>
    </div>
</template>

<script>
    export default {
        name: "ErrorView",
        props: {value: {type: Object}},
        data () {
            return {
                visible: false
            }
        }
    }
</script>

<style scoped>

</style>
