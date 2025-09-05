<script setup lang="ts">
import {EnumServerStatus, ServerRecord} from "../../types/Server";
import ServerActionSettingDialog from "./ServerActionSettingDialog.vue";
import {ref} from "vue";

const props = defineProps<{
    record: ServerRecord,
}>()
const actionSettingDialog = ref<InstanceType<typeof ServerActionSettingDialog> | null>(null)

</script>

<template>
    <a-tooltip :content="$t('设置')">
        <a-button class="mr-2"
                  @click="actionSettingDialog?.show()"
                  :disabled="props.record.status !== EnumServerStatus.STOPPED&&props.record.status !== EnumServerStatus.ERROR">
            <template #icon>
                <icon-settings/>
            </template>
        </a-button>
    </a-tooltip>
    <ServerActionSettingDialog :record="props.record" ref="actionSettingDialog"/>
</template>
