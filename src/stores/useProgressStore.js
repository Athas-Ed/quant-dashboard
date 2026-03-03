// stores/useProgressStore.js
import { reactive, computed } from 'vue'

export function useProgressStore() {
    const defaultDate = new Date().toISOString().slice(0, 10)
    const defaultState = {
        date: defaultDate, // 当前日期 yyyy-mm-dd
        // 英语部分
        english_words_groups: 0,   // 背单词组数（每组20个，5分/组，上限20分）
        english_review: false,     // 复习旧词 (10分)
        english_course: false,     // 看课程 (20分)
        english_exam_count: 0,     // 真题题数（5分/题，上限30分）
        // 编程部分
        coding_work_units: 0,      // 深度工作单元（每单元30分钟），每单元5分，上限30分
        coding_extra_blog: 0,      // 博客笔记 (10分)
        coding_extra_debug: 0,     // 解决技术难点 (5分/个)
        coding_extra_opt: 0,       // 优化细节 (5分/个)
        // 可选部分
        extra_coding_units: 0,     // 超额编程单元（每单元30分钟），每单元5分，上限30分
        painting_practice_unit: 0, // 练习单元 (10分/个)
        painting_stage_unit: 0,    // 作品阶段单元 (10分/个)
        writing_draft_unit: 0,     // 初创单元 (30分/个)
        writing_revise_unit: 0,    // 精修单元 (20分/个)
    }

    const numericFields = [
        'english_words_groups',
        'english_exam_count',
        'coding_work_units',
        'coding_extra_blog',
        'coding_extra_debug',
        'coding_extra_opt',
        'extra_coding_units',
        'painting_practice_unit',
        'painting_stage_unit',
        'writing_draft_unit',
        'writing_revise_unit',
    ]

    const englishBooleanFields = [
        'english_review',
        'english_course',
    ]

    const state = reactive({ ...defaultState })

    function toNonNegativeInt(value) {
        const num = Number(value)
        if (!Number.isFinite(num) || num < 0) return 0
        return Math.floor(num)
    }

    function normalizeIntoState(source, date = state.date) {
        state.date = date

        englishBooleanFields.forEach((field) => {
            // 兼容历史数据: 20/10/0、true/false、"20"/"0"
            state[field] = !!toNonNegativeInt(source[field] ?? defaultState[field])
        })

        numericFields.forEach((field) => {
            state[field] = toNonNegativeInt(source[field] ?? defaultState[field])
        })

        // 兼容历史字段：english_words 为 20/0 或 true/false
        if ('english_words' in source && !('english_words_groups' in source)) {
            const raw = source.english_words
            const asNumber = toNonNegativeInt(raw)
            if (asNumber > 0) {
                // 历史规则 20分 => 4组
                state.english_words_groups = 4
            } else {
                state.english_words_groups = 0
            }
        }

        // 兼容历史字段：english_exam 为 10/0 或 true/false
        if ('english_exam' in source && !('english_exam_count' in source)) {
            const raw = source.english_exam
            const asNumber = toNonNegativeInt(raw)
            // 历史规则 10分 => 新规则下等价 2题
            state.english_exam_count = asNumber > 0 ? 2 : 0
        }

        // 兼容历史导入字段（分钟）: 自动换算为单元
        if ('coding_duration' in source && !('coding_work_units' in source)) {
            state.coding_work_units = Math.floor(toNonNegativeInt(source.coding_duration) / 30)
        }
        if ('extra_coding_duration' in source && !('extra_coding_units' in source)) {
            state.extra_coding_units = Math.floor(toNonNegativeInt(source.extra_coding_duration) / 30)
        }
    }

    // 计算各项分数
    const scores = computed(() => {
        const englishWordsScore = Math.min(state.english_words_groups * 5, 20)
        const englishExamScore = Math.min(state.english_exam_count * 5, 30)
        const englishRaw =
            englishWordsScore +
            (state.english_review ? 10 : 0) +
            (state.english_course ? 20 : 0) +
            englishExamScore
        const english = Math.min(englishRaw, 60)

        const codingDurationScore = Math.min(state.coding_work_units * 5, 30)
        const codingExtraRaw =
            state.coding_extra_blog * 10 +
            state.coding_extra_debug * 5 +
            state.coding_extra_opt * 5
        const codingExtra = Math.min(codingExtraRaw, 10) // 三项共用10分上限
        const coding = Math.min(codingDurationScore + codingExtra, 40) // 编程部分封顶40分

        const extraCoding = Math.min(state.extra_coding_units * 5, 30)
        const painting = state.painting_practice_unit * 10 + state.painting_stage_unit * 10
        const writing = state.writing_draft_unit * 30 + state.writing_revise_unit * 20
        const optionalRaw = extraCoding + painting + writing
        const optional = Math.min(optionalRaw, 60)

        const total = english + coding + optional // 可选部分封顶60分

        return {
            englishWordsScore,
            englishExamScore,
            englishRaw,
            english,
            codingDurationScore,
            codingExtraRaw,
            codingExtra,
            coding,
            optionalRaw,
            optional,
            total
        }
    })

    // 重置为初始值（仅内存态）
    function reset(date = state.date) {
        normalizeIntoState({}, date)
    }

    return {
        state,
        scores,
        reset
    }
}