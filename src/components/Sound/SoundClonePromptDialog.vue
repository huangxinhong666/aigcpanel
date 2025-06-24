<script setup lang="ts">
import {ref} from "vue";
import {SoundClonePromptRecord, useSoundClonePromptStore} from "../../store/modules/soundClonePrompt";
import SoundClonePromptEditDialog from "./SoundClonePromptEditDialog.vue";
import {Dialog} from "../../lib/dialog";
import AudioPlayer from "../common/AudioPlayer.vue";
import {t} from "../../lang";

const visible = ref(false)
const soundClonePromptStore = useSoundClonePromptStore()
const soundClonePromptEditDialog = ref<InstanceType<typeof SoundClonePromptEditDialog>>(null)

const show = () => {
    visible.value = true
}

const columns = [
    {
        title: t('名称'),
        dataIndex: 'name',
        width: 100,
    },
    {
        title: t('参考文字'),
        dataIndex: 'promptText',
        width: 200,
    },
    {
        title: t('参考声音'),
        slotName: 'promptPlayer',
    },
    {
        title: t('操作'),
        slotName: 'operate',
        width: 80,
    }
]

const doDelete = async (record: SoundClonePromptRecord) => {
    await Dialog.confirm(t('确认删除？'))
    await soundClonePromptStore.delete(record.name)
}

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
            {{ $t('声音角色') }}
        </template>
        <div>
            <div class="mb-3">
                <a-button @click="soundClonePromptEditDialog?.add()">
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
                         :data="soundClonePromptStore.records">
                    <template #promptPlayer="{ record }">
                        <AudioPlayer show-wave :url="'file://'+record.promptWav"/>
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
    <SoundClonePromptEditDialog ref="soundClonePromptEditDialog"/>
</template>
