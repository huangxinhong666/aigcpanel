<script setup lang="ts">
import {computed, ref} from "vue";

const props = defineProps({
    config: {
        type: Object,
        default: () => {
            return null
        }
    },
    func: {
        type: String,
        default: ''
    }
})
const visible = ref(false)
const content = computed(() => {
    if (!props.config) {
        return ''
    }
    const lines: string[] = []
    if (props.config.content) {
        lines.push(props.config.content as string)
    }
    if (props.func && props.config.functions && props.config.functions[props.func] && props.config.functions[props.func].content) {
        lines.push(props.config.functions[props.func].content as string)
    }
    return lines.join('\n')
})
</script>

<template>
    <a-button v-if="content" @click="visible=true">
        {{ $t('使用说明') }}
    </a-button>
    <a-modal
        v-model:visible="visible"
        width="40rem"
        :footer="false"
        title-align="start">
        <template #title>
            {{ $t('使用说明') }}
        </template>
        <div class="overflow-y-auto overflow-x-hidden leading-6" style="max-height:60vh;">
            <div v-html="content"></div>
        </div>
    </a-modal>
</template>
