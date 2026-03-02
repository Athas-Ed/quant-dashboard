// stores/useProgressStore.js
import { reactive, computed } from 'vue'

export function useProgressStore() {
    const defaultDate = new Date().toISOString().slice(0, 10)
    const defaultState = {
        date: defaultDate, // 当前日期 yyyy-mm-dd
        // 英语部分（布尔值，便于与复选框绑定）
        english_words: false,      // 背新词 (20分)
        english_review: false,     // 复习旧词 (10分)
        english_course: false,     // 看课程 (20分)
        english_exam: false,       // 真题练习 (10分)
        // 编程部分
        coding_duration: 0,        // 深度工作时长（分钟），每30分钟5分，上限30分
        coding_extra_blog: 0,      // 博客笔记 (10分)
        coding_extra_debug: 0,     // 解决技术难点 (5分/个)
        coding_extra_opt: 0,       // 优化细节 (5分/个)
        // 可选部分
        extra_coding_duration: 0,  // 超额编程时长（分钟），每30分钟5分，上限30分
        painting_practice_unit: 0, // 练习单元 (10分/个)
        painting_stage_unit: 0,    // 作品阶段单元 (10分/个)
        writing_draft_unit: 0,     // 初创单元 (30分/个)
        writing_revise_unit: 0,    // 精修单元 (20分/个)
    }

    const numericFields = [
        'coding_duration',
        'coding_extra_blog',
        'coding_extra_debug',
        'coding_extra_opt',
        'extra_coding_duration',
        'painting_practice_unit',
        'painting_stage_unit',
        'writing_draft_unit',
        'writing_revise_unit',
    ]

    const englishBooleanFields = [
        'english_words',
        'english_review',
        'english_course',
        'english_exam',
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
    }

    // 计算各项分数
    const scores = computed(() => {
        const english =
            (state.english_words ? 20 : 0) +
            (state.english_review ? 10 : 0) +
            (state.english_course ? 20 : 0) +
            (state.english_exam ? 10 : 0)

        const codingDurationScore = Math.min(Math.floor(state.coding_duration / 30) * 5, 30)
        const codingExtraRaw =
            state.coding_extra_blog * 10 +
            state.coding_extra_debug * 5 +
            state.coding_extra_opt * 5
        const codingExtra = Math.min(codingExtraRaw, 10) // 三项共用10分上限
        const coding = Math.min(codingDurationScore + codingExtra, 40) // 编程部分封顶40分

        const extraCoding = Math.min(Math.floor(state.extra_coding_duration / 30) * 5, 30)
        const painting = state.painting_practice_unit * 10 + state.painting_stage_unit * 10
        const writing = state.writing_draft_unit * 30 + state.writing_revise_unit * 20
        const optionalRaw = extraCoding + painting + writing
        const optional = Math.min(optionalRaw, 60)

        const total = english + coding + optional // 可选部分封顶60分

        return {
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