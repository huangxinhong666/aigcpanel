<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import {TimeUtil} from "../../lib/util";

const props = defineProps<{
    start: number | undefined;
    end: number | undefined;
}>();

const currentTime = ref(Date.now());

const duration = computed(() => {
    if (!props.start) {
        return null
    }
    let end = props.end;
    if (!end) {
        end = currentTime.value;
    }
    const durationMs = end - props.start;
    const durationSeconds = Math.floor(durationMs / 1000);
    return TimeUtil.secondsToHuman(durationSeconds);
});

let interval = null as any
onMounted(() => {
    interval = setInterval(() => {
        currentTime.value = Date.now();
    }, 1000);
});

onBeforeUnmount(() => {
    clearInterval(interval);
});

</script>

<template>
    <div class="bg-gray-100 text-xs rounded-full px-2 leading-8">
        {{ duration }}
    </div>
</template>

<style scoped>

</style>
