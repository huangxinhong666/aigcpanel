<script setup lang="ts">

import AudioPlayer from "../../components/common/AudioPlayer.vue";
import SoundClonePromptDialog from "../../components/Sound/SoundClonePromptDialog.vue";
import {onBeforeUnmount, onMounted, ref} from "vue";
import {SoundCloneRecord, SoundCloneService} from "../../service/SoundCloneService";
import {TaskChangeType, useTaskStore} from "../../store/modules/task";
import SoundCloneCreate from "../../components/Sound/SoundCloneCreate.vue";
import SoundCloneActionDownload from "../../components/Sound/SoundCloneActionDownload.vue";
import SoundCloneActionDelete from "../../components/Sound/SoundCloneActionDelete.vue";
import TaskBizStatus from "../../components/common/TaskBizStatus.vue";
import SoundDuration from "../../components/Sound/SoundDuration.vue";
import ServerTaskResultParam from "../../components/Server/ServerTaskResultParam.vue";

const soundClonePromptDialog = ref<InstanceType<typeof SoundClonePromptDialog>>()

const records = ref<SoundCloneRecord[]>([])
const taskStore = useTaskStore()

const taskChangeCallback = (bizId: string, type: TaskChangeType) => {
    doRefresh()
}

onMounted(async () => {
    await doRefresh()
    taskStore.onChange('SoundClone', taskChangeCallback)
})
onBeforeUnmount(() => {
    taskStore.offChange('SoundClone', taskChangeCallback)
})

const doRefresh = async () => {
    records.value = await SoundCloneService.list()
}

</script>

<template>
    <div class="p-5">
        <div class="mb-4 flex items-center">
            <div class="text-3xl font-bold flex-grow">
                {{ $t('声音克隆') }}
            </div>
            <div class="flex items-center">
                <a-button class="ml-1" @click="soundClonePromptDialog?.show()">
                    <template #icon>
                        <i class="iconfont icon-sound-prompt"></i>
                    </template>
                    {{ $t('声音角色') }}
                </a-button>
                <a-tooltip v-if="0"
                           :content="$t('清空历史')" position="right">
                    <a-button class="ml-1">
                        <template #icon>
                            <icon-delete/>
                        </template>
                    </a-button>
                </a-tooltip>
            </div>
        </div>
        <div>
            <SoundCloneCreate @submitted="doRefresh"/>

            <div>
                <div v-for="r in records" :key="r.id">
                    <div class="rounded-xl shadow border p-4 mt-4 hover:shadow-lg">
                        <div class="flex items-center">
                            <div class="flex-grow flex items-center">
                                <div class="inline-block mr-2 bg-blue-100 rounded-lg px-2 leading-8 h-8">
                                    #{{ r.id }}
                                </div>
                                <div class="inline-block mr-2 bg-blue-100 rounded-lg px-2 leading-8 h-8">
                                    <i class="iconfont icon-server mr-1"></i>
                                    {{ r.serverTitle }}
                                    v{{ r.serverVersion }}
                                </div>
                                <div class="inline-block mr-2 bg-blue-100 rounded-lg px-2 leading-8 h-8">
                                    <i class="iconfont icon-sound-prompt mr-1"></i>
                                    {{ r.promptName }}
                                </div>
                                <div v-if="r.param.speed"
                                     class="inline-block mr-2 bg-blue-100 rounded-lg px-2 leading-8 h-8">
                                    <i class="iconfont icon-speed mr-1"></i>
                                    <span class="">x{{ r.param.speed }}</span>
                                </div>
                                <div v-if="r.param.crossLingual"
                                     class="inline-block mr-2 bg-blue-100 rounded-lg px-2 leading-8 h-8">
                                    <i class="iconfont icon-global mr-1"></i>
                                    <span class="">{{ $t('跨语种') }}</span>
                                </div>
                                <ServerTaskResultParam :record="r as any"/>
                            </div>
                            <div class="ml-1">
                                <SoundDuration :start="r.startTime" :end="r.endTime"/>
                            </div>
                            <div class="ml-1">
                                <TaskBizStatus :status="r.status" :status-msg="r.statusMsg"/>
                            </div>
                        </div>
                        <div class="pt-4">
                            {{ r.text }}
                        </div>
                        <div class="pt-4" v-if="r.resultWav">
                            <AudioPlayer
                                show-wave
                                :url="'file://'+r.resultWav"/>
                        </div>
                        <div class="pt-4">
                            <SoundCloneActionDownload :record="r"/>
                            <SoundCloneActionDelete :record="r" @update="doRefresh"/>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
    <SoundClonePromptDialog ref="soundClonePromptDialog"/>
</template>

<style scoped>

</style>
