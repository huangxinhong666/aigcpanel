import {t} from "../lang";

export function functionToLabels(functions: string[]) {
    return functions.map(f => functionToLabel(f))
}

export function functionToLabel(f: string) {
    const map = {
        'soundTts': t('语音合成'),
        'soundClone': t('声音克隆'),
        'videoGen': t('视频合成'),
    }
    return map[f] || f
}

export function buildServerContent(config: any) {
    const contentLines: string[] = []
    if (config?.content) {
        contentLines.push(config.content as string)
    }
    if (config.functions) {
        for (const func in config.functions) {
            if (config.functions[func].content) {
                contentLines.push('<p class="font-bold">' + functionToLabel(func) + '</p>')
                contentLines.push(config.functions[func].content as string)
            }
        }
    }
    return contentLines.join('\n')
}

export function contentToFilenamePathPart(text: string, limit: number = 10) {
    return text
        // 只保留字母、文字信息
        .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '')
        .substring(0, limit)

}
