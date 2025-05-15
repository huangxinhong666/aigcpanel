<script setup lang="ts">
import {ref} from "vue";
import {useSoundClonePromptStore} from "../../store/modules/soundClonePrompt";
import AudioPlayer from "../common/AudioPlayer.vue";
import {AudioUtil} from "../../lib/audio";
import WebFileSelectButton from "../common/WebFileSelectButton.vue";
import {Dialog} from "../../lib/dialog";
import {StringUtil} from "../../lib/util";
import {t} from "../../lang";

const visible = ref(false)
const audioPlayer = ref<InstanceType<typeof AudioPlayer>>(null)
const soundClonePromptStore = useSoundClonePromptStore()

const formData = ref({
    name: '',
    promptWav: '',
    promptText: '',
})

const add = () => {
    formData.value.name = ''
    formData.value.promptWav = ''
    formData.value.promptText = ''
    visible.value = true
}

const onSelectFile = async (file) => {
    await audioPlayer.value.setRecordFromFile(file)
}

const doSave = async () => {
    if (!formData.value.name) {
        Dialog.tipError(t('请输入名称'))
        return
    }
    const audioBuffer = audioPlayer.value.getAudioBuffer()
    if (!audioBuffer) {
        Dialog.tipError(t('请录制声音'))
        return
    }
    if (!formData.value.promptText) {
        Dialog.tipError(t('请输入参考文字'))
        return
    }
    const exists = await soundClonePromptStore.getByName(formData.value.name)
    if (exists) {
        Dialog.tipError(t('名称重复'))
        return
    }
    const wav = AudioUtil.audioBufferToWav(audioBuffer)
    formData.value.promptWav = `soundClonePrompt/${StringUtil.random()}.wav`
    await window.$mapi.file.writeBuffer(formData.value.promptWav, wav)
    formData.value.promptWav = await window.$mapi.file.fullPath(formData.value.promptWav)
    await soundClonePromptStore.add({
        name: formData.value.name,
        promptWav: formData.value.promptWav,
        promptText: formData.value.promptText,
    })
    visible.value = false
}

defineExpose({
    add
})

const emit = defineEmits({
    update: () => true
})

</script>

<template>
    <a-modal v-model:visible="visible"
             width="60vw"
             title-align="start">
        <template #title>
            {{ $t('添加角色') }}
        </template>
        <template #footer>
            <a-button type="primary" @click="doSave">
                {{ $t('保存') }}
            </a-button>
        </template>
        <div style="max-height:60vh;">
            <a-form :model="{}" layout="vertical">
                <a-form-item :label="$t('名称')" required>
                    <a-input v-model="formData.name"/>
                </a-form-item>
                <a-form-item :label="$t('参考声音')" required>
                    <div class="w-full">
                        <div class="mb-3">
                            <a-alert>
                                {{ $t('参考声音需要大于 3s 小于 30s，保证声音清晰可见') }}
                            </a-alert>
                        </div>
                        <div class="mb-3">
                            <AudioPlayer ref="audioPlayer" show-wave trim-enable record-enable/>
                        </div>
                        <div class="mb-3 text-gray-400 flex items-center">
                            <div class="flex-grow text-sm">
                                <icon-info-circle/>
                                {{ $t('支持 wav/mp3 格式') }}
                            </div>
                            <div>
                                <WebFileSelectButton @select-file="onSelectFile"
                                                     accept="audio/wav,audio/mp3">
                                    <a-button>
                                        <template #icon>
                                            <icon-upload/>
                                        </template>
                                        {{ $t('选择声音文件') }}
                                    </a-button>
                                </WebFileSelectButton>
                            </div>
                        </div>
                    </div>
                </a-form-item>
                <a-form-item :label="$t('参考文字')" required>
                    <div class="w-full">
                        <div class="mb-3">
                            <a-input v-model="formData.promptText"/>
                        </div>
                        <div class="text-gray-400 text-sm">
                            <icon-info-circle/>
                            {{ $t('需要输入参考声音的完整文字内容') }}
                        </div>
                    </div>
                </a-form-item>
            </a-form>
        </div>
    </a-modal>
</template>
