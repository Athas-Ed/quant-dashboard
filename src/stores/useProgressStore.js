// stores/useProgressStore.js
import { reactive, computed } from 'vue'

export const DEFAULT_PROGRESS_STATE = {
    date: '', // yyyy-mm-dd，由调用方设置
    english_words_groups: 0,
    english_review: false,
    english_course: false,
    english_exam_count: 0,
    agent_work_units: 0,
    agent_exercise_groups: 0,
    agent_knowledge_units: 0,
    agent_report_count: 0,
    extra_agent_units: 0,
    painting_practice_unit: 0,
    painting_stage_unit: 0,
    writing_ideas_done: false,
    writing_draft_unit: 0,
    writing_revise_unit: 0,
}

const NUMERIC_FIELDS = [
    'english_words_groups',
    'english_exam_count',
    'agent_work_units',
    'agent_exercise_groups',
    'agent_knowledge_units',
    'agent_report_count',
    'extra_agent_units',
    'painting_practice_unit',
    'painting_stage_unit',
    'writing_draft_unit',
    'writing_revise_unit',
]

const BOOLEAN_FIELDS = ['english_review', 'english_course', 'writing_ideas_done']

function toNonNegativeInt(value) {
    const num = Number(value)
    if (!Number.isFinite(num) || num < 0) return 0
    return Math.floor(num)
}

function toBool(value) {
    if (value === true || value === 'true') return true
    return toNonNegativeInt(value) > 0
}

/**
 * 纯函数：与录入页、统计页共用同一套计分口径（plain object，非 reactive）
 */
export function computeProgressScores(raw) {
    const s = { ...DEFAULT_PROGRESS_STATE, ...raw }
    NUMERIC_FIELDS.forEach((k) => {
        s[k] = toNonNegativeInt(s[k])
    })
    BOOLEAN_FIELDS.forEach((k) => {
        s[k] = toBool(s[k])
    })

    const englishWordsScore = Math.min(s.english_words_groups * 10, 30)
    const englishExamScore = Math.min(s.english_exam_count * 5, 30)
    const englishReviewScore = s.english_review ? 20 : 0
    const englishCourseScore = s.english_course ? 10 : 0
    const englishRaw = englishWordsScore + englishExamScore + englishReviewScore + englishCourseScore
    const english = Math.min(englishRaw, 60)

    const regularUnits = s.agent_work_units
    const extraUnits = s.extra_agent_units
    const regularWorkScore = Math.min(regularUnits * 5, 30)
    const needPts = Math.max(0, 30 - regularWorkScore)
    const unitsToFillMust = Math.min(extraUnits, Math.ceil(needPts / 5))
    const extraAfterMust = extraUnits - unitsToFillMust
    const agentWorkScore = Math.min(30, regularWorkScore + unitsToFillMust * 5)

    const agentExerciseScore = Math.min(s.agent_exercise_groups * 5, 30)
    const agentKnowledgeScore = Math.min(s.agent_knowledge_units * 5, 30)
    const agentReportScore = Math.min(s.agent_report_count * 10, 30)
    const agentRaw = agentWorkScore + agentExerciseScore + agentKnowledgeScore + agentReportScore
    const agent = Math.min(agentRaw, 80)

    const extraAgentOptionalScore = Math.min(extraAfterMust * 5, 20)
    const paintingScore = s.painting_practice_unit * 10 + s.painting_stage_unit * 10
    const writingScore =
        (s.writing_ideas_done ? 20 : 0) + s.writing_draft_unit * 30 + s.writing_revise_unit * 20
    const optionalRaw = extraAgentOptionalScore + paintingScore + writingScore
    const optional = Math.min(optionalRaw, 60)

    const must = english + agent
    const total = must + optional

    return {
        englishWordsScore,
        englishExamScore,
        englishReviewScore,
        englishCourseScore,
        englishRaw,
        english,
        regularWorkScore,
        unitsToFillMust,
        extraAfterMust,
        agentWorkScore,
        agentExerciseScore,
        agentKnowledgeScore,
        agentReportScore,
        agentRaw,
        agent,
        extraAgentOptionalScore,
        paintingScore,
        writingScore,
        optionalRaw,
        optional,
        must,
        total,
    }
}

export function useProgressStore() {
    const defaultDate = new Date().toISOString().slice(0, 10)
    const state = reactive({
        ...DEFAULT_PROGRESS_STATE,
        date: defaultDate,
    })

    function normalizeIntoState(source, date = state.date) {
        state.date = date
        BOOLEAN_FIELDS.forEach((field) => {
            const v = source[field]
            state[field] = v === undefined ? false : toBool(v)
        })
        NUMERIC_FIELDS.forEach((field) => {
            const v = source[field]
            state[field] = v === undefined ? 0 : toNonNegativeInt(v)
        })
    }

    const scores = computed(() => computeProgressScores(state))

    function reset(date = state.date) {
        normalizeIntoState({}, date)
    }

    return {
        state,
        scores,
        reset,
    }
}
