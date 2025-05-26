import {defineStore} from "pinia"
import store from "../index";
import {EnumServerStatus, EnumServerType, ServerRecord, ServerRuntime} from "../../types/Server";
import {computed, ref, toRaw} from "vue";
import {cloneDeep} from "lodash-es";
import {ComputedRef} from "@vue/reactivity";
import {TimeUtil} from "../../lib/util";
import {tasks} from "../../task";
import {TaskBiz, useTaskStore} from "./task";


const taskStore = useTaskStore()
const serverRuntime = ref<Map<string, ServerRuntime>>(new Map())
const createServerStatus = (record: ServerRecord): ComputedRef<EnumServerStatus> => {
    return computed(() => {
        if (record.type === EnumServerType.CLOUD) {
            return EnumServerStatus.RUNNING
        }
        return serverRuntime.value?.get(record.key)?.status || EnumServerStatus.STOPPED
    })
}
const getServerRuntimeComputedValue = (record: ServerRecord): ComputedRef<ServerRuntime> => {
    return computed(() => {
        let defaultStatus = EnumServerStatus.STOPPED
        if (record.type === EnumServerType.CLOUD) {
            defaultStatus = EnumServerStatus.RUNNING
        }
        return serverRuntime.value?.get(record.key) || {
            status: defaultStatus,
        } as ServerRuntime
    })
}
const getOrCreateServerRuntime = (record: ServerRecord): ServerRuntime => {
    const value = serverRuntime.value?.get(record.key)
    if (value) {
        return value
    }
    const defaultValue = {
        status: EnumServerStatus.STOPPED,
        eventChannelName: undefined,
        logFile: '',
    } as ServerRuntime
    if (record.type === EnumServerType.CLOUD) {
        defaultValue.status = EnumServerStatus.RUNNING
        defaultValue.eventChannelName = createEventChannel(record, defaultValue)
        defaultValue.logFile = `logs/${record.name}_${record.version}_${TimeUtil.dateString()}.log`
    }
    serverRuntime.value?.set(record.key, defaultValue)
    return serverRuntime.value?.get(record.key) as ServerRuntime
}
const deleteServerRuntime = (record: ServerRecord) => {
    serverRuntime.value?.delete(record.key)
}

const createEventChannel = (server: ServerRecord, serverRuntime?: ServerRuntime) => {
    if (!serverRuntime) {
        serverRuntime = getOrCreateServerRuntime(server)
    }
    const eventChannel = window.__page.createChannel(function (channelData) {
        const {type, data} = channelData
        switch (type) {
            case 'success':
                clearTimeout(serverRuntime.pingCheckTimer)
                serverRuntime.status = EnumServerStatus.STOPPED
                window.__page.destroyChannel(eventChannel)
                updateRunningServerCount().then()
                break
            case 'error':
                clearTimeout(serverRuntime.pingCheckTimer)
                serverRuntime.status = EnumServerStatus.ERROR
                window.__page.destroyChannel(eventChannel)
                updateRunningServerCount().then()
                break
            case 'starting':
            case 'stopping':
            case 'stopped':
                break
            case 'taskRunning':
            case 'taskResult':
            case 'taskStatus':
                const {id} = data
                const [biz, bizId] = id.split('_')
                // console.log('task', {type, biz, bizId, data})
                if ('taskRunning' === type) {
                    (tasks[biz] as TaskBiz).update?.(bizId, {
                        status: 'running',
                        startTime: TimeUtil.timestampMS(),
                    }).then(() => {
                        taskStore.fireChange({
                            biz,
                            bizId,
                        } as any, 'running')
                    })
                } else if ('taskResult' === type) {
                    (tasks[biz] as TaskBiz).update?.(bizId, {
                        result: data.result,
                    }).then(() => {
                        taskStore.fireChange({
                            biz,
                            bizId,
                        } as any, 'running')
                    })
                }
                break
            default:
                console.log('eventChannel.unknown', type, data)
                break
        }
    })
    return eventChannel
}

const updateRunningServerCount = async () => {
    const count = server.records.filter(r => {
        return r.type === EnumServerType.LOCAL_DIR && r.status === EnumServerStatus.RUNNING
    }).length
    await window.$mapi.server.runningServerCount(count)
}

export const serverStore = defineStore("server", {
    state: () => ({
        records: [] as ServerRecord[],
    }),
    actions: {
        async init() {
            await window.$mapi.storage.get("server", "records", [])
                .then((records) => {
                    records.forEach((record: ServerRecord) => {
                        record.status = createServerStatus(record)
                        record.runtime = getServerRuntimeComputedValue(record)
                    })
                    this.records = records
                })
            await this.refresh()
        },
        async refresh() {
            const dirs = await window.$mapi.file.list('model')
            const localRecords: ServerRecord[] = []
            for (let dir of dirs) {
                const config = await window.$mapi.file.read(`model/${dir.name}/config.json`)
                let json
                try {
                    json = JSON.parse(config)
                } catch (e) {
                    continue
                }
                if (!json) {
                    continue
                }
                localRecords.push({
                    key: this.generateServerKey({
                        name: json.name,
                        version: json.version,
                    } as any),
                    name: json.name || dir.name,
                    title: json.title || dir.name,
                    version: json.version || '1.0.0',
                    type: EnumServerType.LOCAL,
                    functions: json.functions || [],
                    localPath: `model/${dir.name}`,
                    settings: json.settings || [],
                    setting: json.setting || {},
                } as ServerRecord)
            }
            let changed = false
            for (let lr of localRecords) {
                const record = this.records.find((record) => record.key === lr.key)
                if (!record) {
                    lr.status = createServerStatus(lr)
                    lr.runtime = getServerRuntimeComputedValue(lr)
                    this.records.unshift(lr as any)
                    changed = true
                } else {
                    if (!record.settings && lr.settings) {
                        record.settings = lr.settings
                        changed = true
                    }
                }
            }
            if (changed) {
                await this.sync()
            }
        },
        findRecord(server: ServerRecord) {
            return this.records.find((record) => record.key === server.key)
        },
        start: async function (server: ServerRecord) {
            const record = this.findRecord(server)
            if (record?.status === EnumServerStatus.STOPPED || record?.status === EnumServerStatus.ERROR) {
            } else {
                throw new Error('StatusError')
            }
            const serverRuntime = getOrCreateServerRuntime(server)
            serverRuntime.status = EnumServerStatus.STARTING
            serverRuntime.startTimestampMS = TimeUtil.timestampMS()
            serverRuntime.logFile = `logs/${server.name}_${server.version}_${TimeUtil.dateString()}_${serverRuntime.startTimestampMS}.log`
            serverRuntime.eventChannelName = createEventChannel(server)
            const serverInfo = await this.serverInfo(server)
            await window.$mapi.server.start(serverInfo)
            let pingTimeout = 60 * 5 * 1000
            let pingStart = TimeUtil.timestampMS()
            const pingCheck = () => {
                const now = TimeUtil.timestampMS()
                if (now - pingStart > pingTimeout) {
                    // console.log('ping.timeout')
                    serverRuntime.status = EnumServerStatus.ERROR
                    window.$mapi.server.stop(serverInfo)
                    return
                }
                window.$mapi.server.ping(serverInfo)
                    .then(success => {
                        if (success) {
                            serverRuntime.status = EnumServerStatus.RUNNING
                            updateRunningServerCount().then()
                        } else {
                            serverRuntime.pingCheckTimer = setTimeout(pingCheck, 2000)
                        }
                    })
                    .catch(err => {
                        serverRuntime.pingCheckTimer = setTimeout(pingCheck, 2000)
                    })
            }
            serverRuntime.pingCheckTimer = setTimeout(pingCheck, 2 * 1000)
        },
        async stop(server: ServerRecord) {
            const record = this.findRecord(server)
            if (record?.status === EnumServerStatus.RUNNING) {
            } else {
                throw new Error('StatusError')
            }
            const serverRuntime = getOrCreateServerRuntime(server)
            serverRuntime.status = EnumServerStatus.STOPPING
            const serverInfo = await this.serverInfo(server)
            serverInfo.logFile = serverRuntime.logFile
            await window.$mapi.server.stop(serverInfo)
        },
        async updateSetting(key: string, setting: any) {
            const record = this.records.find((record) => record.key === key)
            if (!record) {
                return
            }
            record.setting = Object.assign(record.setting || {}, setting)
            await this.sync()
        },
        async delete(server: ServerRecord) {
            const index = this.records.findIndex((record) => record.key === server.key)
            if (index === -1) {
                return
            }
            const record = this.records[index]
            if (record.status === EnumServerStatus.STOPPED
                || record.status === EnumServerStatus.ERROR) {
            } else {
                if (record.type === EnumServerType.LOCAL_DIR) {
                    throw new Error('StatusError')
                }
            }
            if (record.type === EnumServerType.LOCAL) {
                await window.$mapi.file.deletes(record.localPath as string)
            }
            this.records.splice(index, 1)
            deleteServerRuntime(server)
            await this.sync()
        },
        async add(server: ServerRecord) {
            let record = this.records.find((record) => record.key === server.key)
            if (record) {
                return
            }
            server.status = createServerStatus(server)
            server.runtime = getServerRuntimeComputedValue(server)
            this.records.unshift(server)
            await this.sync()
        },
        async sync() {
            const savedRecords = toRaw(cloneDeep(this.records))
            savedRecords.forEach((record) => {
                record.status = undefined
                record.runtime = undefined
            })
            await window.$mapi.storage.set("server", "records", savedRecords)
        },
        async getByKey(key: string): Promise<ServerRecord | undefined> {
            return this.records.find((record) => record.key === key)
        },
        async getByNameVersion(name: string, version: string): Promise<ServerRecord | undefined> {
            return this.records.find((record) => record.name === name && record.version === version)
        },
        generateServerKey(server: ServerRecord) {
            return `${server.name}|${server.version}`
        },
        async serverInfo(server: ServerRecord) {
            const result = {
                localPath: '',
                name: server.name,
                version: server.version,
                setting: toRaw(server.setting),
                logFile: '',
                eventChannelName: '',
                config: JSON.parse(JSON.stringify(server)),
            }
            if (server.type === EnumServerType.LOCAL) {
                result.localPath = await window.$mapi.file.fullPath(server.localPath as string)
            } else if (server.type === EnumServerType.LOCAL_DIR) {
                result.localPath = server.localPath as string
            } else if (server.type === EnumServerType.CLOUD) {
                result.localPath = server.localPath as string
            }
            const serverRuntime = getOrCreateServerRuntime(server)
            if (serverRuntime) {
                result.logFile = serverRuntime.logFile
                result.eventChannelName = serverRuntime.eventChannelName as string
            }
            return result
        }
    }
})

const server = serverStore(store)
server.init().then(() => {
})

export const useServerStore = () => {
    return server
}
