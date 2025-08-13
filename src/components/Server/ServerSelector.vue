<script setup lang="ts">
import {useServerStore} from "../../store/modules/server";
import {EnumServerStatus, EnumServerType} from "../../types/Server";
import {computed, onMounted, ref, watch} from "vue";

const serverStore = useServerStore()

const select = ref<any>(null)
const props = defineProps<{
    functionName: string
}>()
const recordsFilter = computed(() => {
    return serverStore.records.filter(s => s.functions.includes(props.functionName))
})
const valueStatus = computed(() => {
    return serverStore.records.find(s => s.key === select.value.modelValue)?.status || EnumServerStatus.STOPPED
})
</script>

<template>
    <a-select ref="select" :placeholder="$t('选择模型')" size="small">
        <a-option v-for="server in recordsFilter"
                  :key="server.key"
                  :value="server.key">
            <div class="text-sm flex items-center py-2 flex-nowrap truncate no-wrap">
                <div v-if="server.status===EnumServerStatus.RUNNING"
                     class="w-2 h-2 bg-green-700 rounded-full mr-1 flex-shrink-0"></div>
                <div v-else class="w-2 h-2 bg-red-700 rounded-full mr-1 flex-shrink-0"></div>
                <div class="text-xs flex-grow">
                    {{ server.title }}
                    v{{ server.version }}
                </div>
            </div>
        </a-option>
        <template #label="{ data }">
            <div class="text-sm flex items-center flex-nowrap truncate no-wrap">
                <div v-if="valueStatus===EnumServerStatus.RUNNING"
                     class="w-2 h-2 bg-green-700 rounded-full mr-1 flex-shrink-0"></div>
                <div v-else class="w-2 h-2 bg-red-700 rounded-full mr-1 flex-shrink-0"></div>
                <div v-if="recordsFilter.length>0">
                    {{ data?.label }}
                </div>
                <div v-else>
                    {{ $t('没有可用模型') }}
                </div>
            </div>
        </template>
    </a-select>
</template>
