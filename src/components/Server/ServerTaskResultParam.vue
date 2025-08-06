<script setup lang="ts">
const props = defineProps<{
    record: {
        result: Record<string, any>
    },
}>()
</script>

<template>
    <div v-if="record.result"
         class="inline-block">
        <div v-for="(v,k) in record.result" class="inline-block mr-4">
            <a-tooltip v-if="k as any==='UseCuda' && v" :content="$t('CUDA加速')">
                <div class="bg-green-100 text-green-600 rounded-lg px-2 leading-8 h-8">
                    <i class="iconfont icon-cuda"></i>
                </div>
            </a-tooltip>
            <a-tooltip v-if="k as any==='UseCuda' && !v" content="CPU">
                <div class="bg-yellow-100 text-yellow-600 rounded-lg px-2 leading-8 h-8">
                    <i class="iconfont icon-cpu"></i>
                </div>
            </a-tooltip>
        </div>
    </div>
</template>

