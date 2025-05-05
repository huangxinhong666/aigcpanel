<script setup lang="ts">
import {Dialog} from "../../lib/dialog";
import {t} from "../../lang";
import {sleep} from "../../lib/util";
import {SoundTtsRecord, SoundTtsService} from "../../service/SoundTtsService";

const props = defineProps<{
    record: SoundTtsRecord,
}>()
const emit = defineEmits({
    update: () => true
})

const doDelete = async () => {
    const record = props.record
    Dialog.loadingOn(t('正在删除'))
    await sleep(500)
    await SoundTtsService.delete(record)
    Dialog.loadingOff()
    emit('update')
}
</script>

<template>
    <a-tooltip :content="$t('删除')">
        <a-button class="mr-2"
                  :disabled="record.status!=='success'&&record.status!=='fail'"
                  @click="doDelete()">
            <template #icon>
                <icon-delete/>
            </template>
        </a-button>
    </a-tooltip>
</template>
