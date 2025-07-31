<script setup lang="ts">
import {EnumServerStatus} from "../../types/Server";
import {computed} from "vue";
import {t} from "../../lang";

interface Props {
    status: EnumServerStatus | null
}

const props = defineProps<Props>()

const statusColor = computed(() => {
    const colorMap = {
        [EnumServerStatus.STOPPED]: 'bg-gray-400',
        [EnumServerStatus.STARTING]: 'bg-yellow-500',
        [EnumServerStatus.RUNNING]: 'bg-green-500',
        [EnumServerStatus.STOPPING]: 'bg-yellow-400',
        [EnumServerStatus.ERROR]: 'bg-red-500',
    }
    return colorMap[props.status as string] || 'bg-gray-400'
})

const statusText = computed(() => {
    const textMap = {
        [EnumServerStatus.STOPPED]: t('已停止'),
        [EnumServerStatus.STARTING]: t('启动中'),
        [EnumServerStatus.RUNNING]: t('运行中'),
        [EnumServerStatus.STOPPING]: t('停止中'),
        [EnumServerStatus.ERROR]: t('错误'),
    }
    return textMap[props.status as string] || 'Unknown'
})

</script>

<template>
    <div class="text-white px-2 py-1 rounded-full text-sm inline-flex items-center" :class="statusColor">
        <div class="w-2 h-2 rounded-full bg-white mr-2"></div>
        <div>
            {{ statusText }}
        </div>
    </div>
</template>

