<script setup lang="ts">

import {t} from "../lang";
import {onMounted, ref} from "vue";
import SoundTts from "./Sound/SoundTts.vue";
import SoundClone from "./Sound/SoundClone.vue";
import VideoGen from "./Video/VideoGen.vue";

const platformName = ref<'win' | 'osx' | 'linux' | null>(null);
const tab = ref('soundClone');

onMounted(() => {
    platformName.value = window.$mapi.app.platformName();
});

</script>

<template>
    <div class="pb-device-container h-full relative select-none flex">
        <div class="p-5 w-52 flex-shrink-0 border-r border-solid border-gray-100">
            <div class="p-2 rounded-lg mr-2 mb-4 cursor-pointer"
                 :class="tab === 'soundClone' ? 'bg-gray-100' : ''"
                 @click="tab = 'soundClone'">
                <div class="text-base">
                    <i class="iconfont icon-sound-clone"></i>
                    {{ t('声音克隆') }}
                </div>
            </div>
            <div class="p-2 rounded-lg mr-2 mb-4 cursor-pointer"
                 :class="tab === 'soundTts' ? 'bg-gray-100' : ''"
                 @click="tab = 'soundTts'">
                <div class="text-base">
                    <i class="iconfont icon-sound-generate"></i>
                    {{ t('声音合成') }}
                </div>
            </div>
            <div class="p-2 rounded-lg mr-2 mb-4 cursor-pointer"
                 :class="tab === 'videoGen' ? 'bg-gray-100' : ''"
                 @click="tab = 'videoGen'">
                <div class="text-base">
                    <i class="iconfont icon-video"></i>
                    {{ t('视频合成') }}
                </div>
            </div>
        </div>
        <div class="flex-grow h-full overflow-y-auto">
            <SoundClone v-if="tab === 'soundClone'"/>
            <SoundTts v-else-if="tab === 'soundTts'"/>
            <VideoGen v-else-if="tab === 'videoGen'"/>
        </div>
    </div>
</template>

<style scoped>

</style>
