<script setup lang="ts">
import {Dialog} from "../../lib/dialog";
import {t} from "../../lang";
import {VideoGenRecord} from "../../service/VideoGenService";
import {mapError} from "../../lib/error";

const props = defineProps<{
    record: VideoGenRecord,
}>()

const doDownload = async () => {
    const record = props.record
    const title = `${t('视频合成')}_${record.id}.mp4`
    let filePath = await window.$mapi.file.openSave({
        defaultPath: title
    })
    if (filePath) {
        if (!filePath.endsWith('.mp4')) {
            filePath = filePath + '.mp4'
        }
        // console.log('filePath', record.resultMp4, filePath)
        try {
            await window.$mapi.file.copy(record.resultMp4 as string, filePath, {isFullPath: true})
        } catch (e) {
            console.error(e)
            Dialog.tipError(mapError(e))
            return
        }
        Dialog.tipSuccess(t('下载成功'))
    }
}
</script>

<template>
    <a-tooltip :content="$t('下载')">
        <a-button class="mr-2"
                  :disabled="!record.resultMp4"
                  @click="doDownload()">
            <template #icon>
                <icon-download/>
            </template>
        </a-button>
    </a-tooltip>
</template>
