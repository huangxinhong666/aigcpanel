<script setup lang="ts">
import {ref} from "vue";
import VideoTemplateEditDialog from "./VideoTemplateEditDialog.vue";
import {Dialog} from "../../lib/dialog";
import VideoPlayer from "../common/VideoPlayer.vue";
import {t} from "../../lang";
import {VideoTemplateRecord, VideoTemplateService} from "../../service/VideoTemplateService";

const visible = ref(false)
const videoTemplateEditDialog = ref<InstanceType<typeof VideoTemplateEditDialog>>(null)
const records = ref<VideoTemplateRecord[]>([])

const show = async () => {
    visible.value = true
    await doRefresh()
}

const doRefresh = async () => {
    records.value = await VideoTemplateService.list()
    emit('update')
}

const onUpdate = async () => {
    await doRefresh()
    emit('update')
}

const columns = [
    {
        title: t('名称'),
        dataIndex: 'name',
        width: 200,
    },
    {
        title: t('视频'),
        slotName: 'video',
    },
    {
        title: t('操作'),
        slotName: 'operate',
        width: 80,
    }
]

const doDelete = async (record: VideoTemplateRecord) => {
    await Dialog.confirm(t('确认删除？'))
    await VideoTemplateService.delete(record)
    await doRefresh()
    emit('update')
}

const emit = defineEmits({
    update: () => true
})

defineExpose({
    show
})
</script>

<template>
    <a-modal v-model:visible="visible"
             width="80vw"
             :footer="false"
             title-align="start">
        <template #title>
            {{ $t('视频模板') }}
        </template>
        <div>
            <div class="mb-3">
                <a-button @click="videoTemplateEditDialog?.add()">
                    <template #icon>
                        <icon-plus/>
                    </template>
                    {{ $t('添加') }}
                </a-button>
            </div>
            <div style="height:60vh;">
                <a-table :scroll="{maxHeight:'60vh'}"
                         :columns="columns"
                         :pagination="false"
                         row-key="id"
                         :data="records">
                    <template #video="{ record }">
                        <div class="p-2 shadow rounded-lg bg-gray-400 inline-block">
                            <div class="w-48 h-48">
                                <VideoPlayer :url="'file://'+record.video"/>
                            </div>
                        </div>
                    </template>
                    <template #operate="{ record }">
                        <a-button @click="doDelete(record)">
                            <template #icon>
                                <icon-delete/>
                            </template>
                        </a-button>
                    </template>
                </a-table>
            </div>
        </div>
    </a-modal>
    <VideoTemplateEditDialog @update="onUpdate" ref="videoTemplateEditDialog"/>
</template>
