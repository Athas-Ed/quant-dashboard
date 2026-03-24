<template>
  <div class="page-wrap">
    <main class="container">
      <section class="section-card page-switch">
        <button
          class="btn"
          :class="{ primary: activePage === 'daily' }"
          @click="activePage = 'daily'"
        >
          录入页
        </button>
        <button
          class="btn"
          :class="{ primary: activePage === 'stats' }"
          @click="activePage = 'stats'"
        >
          统计页
        </button>
      </section>

      <StatsView v-if="activePage === 'stats'" />
      <template v-else>
      <header class="header-card">
        <div>
          <h1>每日量化进度表</h1>
          <p class="subtitle">记录每天投入，系统自动换算得分，可导出文本备份。</p>
        </div>
        <label class="date-picker">
          <span>日期</span>
          <input type="date" v-model="state.date" @change="handleDateChange" />
        </label>
      </header>

      <section class="summary-card">
        <h2>今日得分</h2>
        <div class="score-grid">
          <div class="score-item">
            <span class="label">英语</span>
            <strong>{{ scores.english }} / 60</strong>
          </div>
          <div class="score-item">
            <span class="label">AI Agent 开发</span>
            <strong>{{ scores.agent }} / 80</strong>
          </div>
          <div class="score-item">
            <span class="label">可选</span>
            <strong>{{ scores.optional }} / 60</strong>
            <small v-if="scores.optionalRaw > 60">原始 {{ scores.optionalRaw }}，已封顶</small>
          </div>
          <div class="score-item total">
            <span class="label">总分</span>
            <strong>{{ scores.total }} / 200</strong>
          </div>
        </div>
      </section>

      <section class="section-card">
        <h3>必须部分（目标 100 分，上限 140 分）</h3>
        <div class="panel-grid">
          <fieldset>
            <legend>一、英语（上限 60 分）</legend>
            <label class="line-input">
              <span>背单词（每组20个）</span>
              <div class="stepper">
                <input type="number" v-model.number="state.english_words_groups" min="0" step="1" />
                <div class="stepper-buttons">
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('english_words_groups', 1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">+</button>
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('english_words_groups', -1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">-</button>
                </div>
              </div>
              <small>每组 10 分，上限 30 分；当前 {{ itemScores.englishWords }} 分</small>
            </label>
            <label class="line-input">
              <span>做真题练习（题）</span>
              <div class="stepper">
                <input type="number" v-model.number="state.english_exam_count" min="0" step="1" />
                <div class="stepper-buttons">
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('english_exam_count', 1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">+</button>
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('english_exam_count', -1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">-</button>
                </div>
              </div>
              <small>每题 5 分，上限 30 分；当前 {{ itemScores.englishExam }} 分</small>
            </label>
            <label class="line-checkbox">
              <input type="checkbox" v-model="state.english_review" />
              <span>复习旧词（20分）</span>
              <strong class="score-tag">{{ itemScores.englishReview }} 分</strong>
            </label>
            <label class="line-checkbox">
              <input type="checkbox" v-model="state.english_course" />
              <span>看刘晓燕课程 1 节（10分）</span>
              <strong class="score-tag">{{ itemScores.englishCourse }} 分</strong>
            </label>
          </fieldset>

          <fieldset>
            <legend>二、AI Agent 开发（上限 80 分）</legend>
            <label class="line-input">
              <span>工作单元（每组 Agent 开发任务或每 30 分钟）</span>
              <div class="stepper">
                <input type="number" v-model.number="state.agent_work_units" min="0" step="1" />
                <div class="stepper-buttons">
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('agent_work_units', 1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">+</button>
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('agent_work_units', -1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">-</button>
                </div>
              </div>
              <small>每单元 5 分，上限 30 分；当前 {{ itemScores.agentWork }} 分</small>
            </label>
            <label class="line-input">
              <span>练习题组（组）</span>
              <div class="stepper">
                <input type="number" v-model.number="state.agent_exercise_groups" min="0" step="1" />
                <div class="stepper-buttons">
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('agent_exercise_groups', 1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">+</button>
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('agent_exercise_groups', -1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">-</button>
                </div>
              </div>
              <small>每组 5 分，上限 30 分；当前 {{ itemScores.agentExercise }} 分</small>
            </label>
            <label class="line-input">
              <span>知识学习单元（知识点）</span>
              <div class="stepper">
                <input type="number" v-model.number="state.agent_knowledge_units" min="0" step="1" />
                <div class="stepper-buttons">
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('agent_knowledge_units', 1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">+</button>
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('agent_knowledge_units', -1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">-</button>
                </div>
              </div>
              <small>每单元 5 分，上限 30 分；当前 {{ itemScores.agentKnowledge }} 分</small>
            </label>
            <label class="line-input">
              <span>开发复盘/报告（篇）</span>
              <div class="stepper">
                <input type="number" v-model.number="state.agent_report_count" min="0" step="1" />
                <div class="stepper-buttons">
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('agent_report_count', 1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">+</button>
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('agent_report_count', -1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">-</button>
                </div>
              </div>
              <small>每篇 10 分，上限 30 分；当前 {{ itemScores.agentReport }} 分</small>
            </label>
          </fieldset>
        </div>
      </section>

      <section class="section-card">
        <h3>可选部分（封顶 60 分）</h3>
        <div class="panel-grid optional-grid">
          <fieldset>
            <legend>三、超额 Agent 开发单元</legend>
            <label class="line-input">
              <span>超额 Agent 开发单元（每组任务或每 30 分钟）</span>
              <div class="stepper">
                <input type="number" v-model.number="state.extra_agent_units" min="0" step="1" />
                <div class="stepper-buttons">
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('extra_agent_units', 1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">+</button>
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('extra_agent_units', -1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">-</button>
                </div>
              </div>
              <small>每单元 5 分，计入可选上限 20 分；若必须部分「工作单元」未满 30 分，会优先填满该项</small>
            </label>
            <p class="cap-note">计入可选部分：{{ itemScores.extraAgentOptional }} / 20 分</p>
          </fieldset>

          <fieldset>
            <legend>四、绘画</legend>
            <label class="line-input">
              <span>练习单元（个）</span>
              <div class="stepper">
                <input type="number" v-model.number="state.painting_practice_unit" min="0" step="1" />
                <div class="stepper-buttons">
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('painting_practice_unit', 1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">+</button>
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('painting_practice_unit', -1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">-</button>
                </div>
              </div>
              <small>10 分/个；当前 {{ itemScores.paintingPractice }} 分</small>
            </label>
            <label class="line-input">
              <span>作品阶段单元（个）</span>
              <div class="stepper">
                <input type="number" v-model.number="state.painting_stage_unit" min="0" step="1" />
                <div class="stepper-buttons">
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('painting_stage_unit', 1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">+</button>
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('painting_stage_unit', -1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">-</button>
                </div>
              </div>
              <small>10 分/个；当前 {{ itemScores.paintingStage }} 分</small>
            </label>
          </fieldset>

          <fieldset>
            <legend>五、文学创作</legend>
            <label class="line-checkbox">
              <input type="checkbox" v-model="state.writing_ideas_done" />
              <span>构思 / 整理灵感（20分）</span>
              <strong class="score-tag">{{ itemScores.writingIdeas }} 分</strong>
            </label>
            <label class="line-input">
              <span>初创单元（个）</span>
              <div class="stepper">
                <input type="number" v-model.number="state.writing_draft_unit" min="0" step="1" />
                <div class="stepper-buttons">
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('writing_draft_unit', 1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">+</button>
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('writing_draft_unit', -1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">-</button>
                </div>
              </div>
              <small>30 分/个；当前 {{ itemScores.writingDraft }} 分</small>
            </label>
            <label class="line-input">
              <span>精修单元（个）</span>
              <div class="stepper">
                <input type="number" v-model.number="state.writing_revise_unit" min="0" step="1" />
                <div class="stepper-buttons">
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('writing_revise_unit', 1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">+</button>
                  <button type="button" class="step-btn" @pointerdown.prevent="startAdjust('writing_revise_unit', -1)" @pointerup="stopAdjust" @pointerleave="stopAdjust" @pointercancel="stopAdjust">-</button>
                </div>
              </div>
              <small>20 分/个；当前 {{ itemScores.writingRevise }} 分</small>
            </label>
          </fieldset>
        </div>
      </section>

      <section class="section-card">
        <h3>小结（自动计算）</h3>
        <p class="settlement-narrative">{{ settlementNarrative }}</p>
        <div class="goals-grid">
          <div v-for="goal in goals" :key="goal.value" class="goal-row" :class="{ done: goal.done }">
            <span>{{ goal.label }}</span>
            <div class="goal-meta">
              <small>{{ goal.progress }}</small>
              <strong>{{ goal.done ? '已达成' : '未达成' }}</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="section-card">
        <h3>数据操作</h3>
        <div class="actions">
          <button class="btn danger" @click="doReset">重置当天</button>
          <button class="btn primary" @click="copyScoreSummary">生成总结并复制</button>
          <button class="btn" @click="exportData">导出文本</button>
          <button class="btn" @click="importData">导入文本</button>
        </div>
        <p v-if="hint" class="hint">{{ hint }}</p>
        <textarea
          v-if="showImport"
          v-model="importText"
          placeholder="粘贴导出的文本"
        />
        <button v-if="showImport" class="btn primary import-confirm" @click="doImport">
          确认导入
        </button>
      </section>
      </template>
    </main>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, ref } from 'vue'
import { useProgressStore } from './stores/useProgressStore'
const StatsView = defineAsyncComponent(() => import('./components/StatsView.vue'))

const { state, scores, reset } = useProgressStore()
const activePage = ref('daily')

function handleDateChange() {
  // 已移除本地化存储能力，切换日期时仅刷新为空白记录
  reset(state.date)
  hint.value = `已切换到 ${state.date}。`
}

function doReset() {
  reset(state.date)
  hint.value = `已重置 ${state.date} 的记录。`
}

function adjustValue(field, delta) {
  const current = Number(state[field]) || 0
  const next = Math.max(0, current + delta)
  state[field] = next
}

const hint = ref('')
let holdTimeoutId = null
let holdIntervalId = null

function clearHoldTimers() {
  if (holdTimeoutId) {
    clearTimeout(holdTimeoutId)
    holdTimeoutId = null
  }
  if (holdIntervalId) {
    clearInterval(holdIntervalId)
    holdIntervalId = null
  }
}

function startAdjust(field, delta) {
  clearHoldTimers()
  adjustValue(field, delta)
  holdTimeoutId = setTimeout(() => {
    holdIntervalId = setInterval(() => {
      adjustValue(field, delta)
    }, 100)
  }, 320)
}

function stopAdjust() {
  clearHoldTimers()
}

const itemScores = computed(() => ({
  englishWords: scores.value.englishWordsScore,
  englishReview: scores.value.englishReviewScore,
  englishCourse: scores.value.englishCourseScore,
  englishExam: scores.value.englishExamScore,
  agentWork: scores.value.agentWorkScore,
  agentExercise: scores.value.agentExerciseScore,
  agentKnowledge: scores.value.agentKnowledgeScore,
  agentReport: scores.value.agentReportScore,
  extraAgentOptional: scores.value.extraAgentOptionalScore,
  paintingPractice: state.painting_practice_unit * 10,
  paintingStage: state.painting_stage_unit * 10,
  writingIdeas: state.writing_ideas_done ? 20 : 0,
  writingDraft: state.writing_draft_unit * 30,
  writingRevise: state.writing_revise_unit * 20,
}))

const goals = computed(() => {
  const mustScore = scores.value.must
  const optionalScore = scores.value.optional
  return [
    { label: '必须部分达成60分', value: 'must60', done: mustScore >= 60, progress: `${mustScore}/140` },
    { label: '必须部分达成100分', value: 'must100', done: mustScore >= 100, progress: `${mustScore}/140` },
    { label: '必须部分拿满140分', value: 'must140', done: mustScore >= 140, progress: `${mustScore}/140` },
    { label: '可选部分达成30分', value: 'opt30', done: optionalScore >= 30, progress: `${optionalScore}/60` },
    { label: '可选部分拿满60分', value: 'opt60', done: optionalScore >= 60, progress: `${optionalScore}/60` },
  ]
})

const settlementNarrative = computed(() => {
  const parts = []
  parts.push(`今天背新词${state.english_words_groups * 20}个`)
  if (state.english_review) parts.push('复习了旧词')
  if (state.english_course) parts.push('看了一节课程')
  if (state.english_exam_count > 0) parts.push(`练习了${state.english_exam_count}道题`)
  parts.push(`Agent 开发工作单元${state.agent_work_units}个`)
  if (state.agent_exercise_groups > 0) {
    parts.push(`练了${state.agent_exercise_groups}组题`)
  } else {
    parts.push('还没有练题，快去')
  }
  if (state.agent_knowledge_units > 0) {
    parts.push(`知识学习单元${state.agent_knowledge_units}个`)
  } else {
    parts.push('还没有学点东西，快去')
  }
  if (state.agent_report_count > 0) parts.push(`写了${state.agent_report_count}篇开发复盘/报告`)
  if (state.extra_agent_units > 0) parts.push(`额外 Agent 开发单元${state.extra_agent_units}个`)
  if (state.painting_practice_unit > 0) {
    parts.push(`绘画练习了${state.painting_practice_unit}个单元`)
  }
  if (state.painting_stage_unit > 0) {
    parts.push(`推进作品阶段${state.painting_stage_unit}个`)
  }
  const wb = []
  if (state.writing_ideas_done) wb.push('整理了灵感')
  if (state.writing_draft_unit > 0) wb.push(`初创${state.writing_draft_unit}篇`)
  if (state.writing_revise_unit > 0) wb.push(`精修${state.writing_revise_unit}篇`)
  if (wb.length) parts.push(`文学初创：${wb.join('，')}`)
  parts.push('加油~。')
  return parts.join('，')
})

const autoGoalValues = computed(() => goals.value.filter((goal) => goal.done).map((goal) => goal.value))

function copyScoreSummary() {
  const mustScore = scores.value.must
  const achieved = goals.value.filter((g) => g.done)
  const goalsBlock =
    achieved.length > 0
      ? achieved.map((g) => `- ${g.label} √`).join('\n')
      : '- （今日暂无已达成目标档）'

  const lines = [
    `${state.date} 每日量化总结`,
    '',
    '【今日小结】',
    settlementNarrative.value,
    '',
    '【量化统计】',
    `- 英语得分：${scores.value.english}/60`,
    `- AI Agent 开发得分：${scores.value.agent}/80`,
    `- 可选得分：${scores.value.optional}/60`,
    `- 必须部分总分：${mustScore}/140`,
    `- 总分：${scores.value.total}/200`,
    '',
    '【目标达成】',
    goalsBlock,
    '',
    '自评一句吧：',
    '',
  ].join('\n')

  navigator.clipboard.writeText(lines).then(() => {
    hint.value = '当前分数总结已复制到剪贴板。'
  }).catch(() => {
    hint.value = '复制失败，请重试。'
  })
}

// 导出为纯文本
function exportData() {
  const lines = [
    `[${state.date}]`,
    `english_words_groups=${state.english_words_groups}`,
    `english_review=${state.english_review ? 1 : 0}`,
    `english_course=${state.english_course ? 1 : 0}`,
    `english_exam_count=${state.english_exam_count}`,
    `agent_work_units=${state.agent_work_units}`,
    `agent_exercise_groups=${state.agent_exercise_groups}`,
    `agent_knowledge_units=${state.agent_knowledge_units}`,
    `agent_report_count=${state.agent_report_count}`,
    `extra_agent_units=${state.extra_agent_units}`,
    `painting_practice_unit=${state.painting_practice_unit}`,
    `painting_stage_unit=${state.painting_stage_unit}`,
    `writing_ideas_done=${state.writing_ideas_done ? 1 : 0}`,
    `writing_draft_unit=${state.writing_draft_unit}`,
    `writing_revise_unit=${state.writing_revise_unit}`,
    `total=${scores.value.total}`,
    `goals=${autoGoalValues.value.join(',')}`
  ].join('\n')
  navigator.clipboard.writeText(lines).then(() => {
    hint.value = '导出文本已复制到剪贴板。'
  }).catch(() => {
    hint.value = '复制失败，请手动复制文本。'
  })
}

// 导入相关
const showImport = ref(false)
const importText = ref('')
function importData() {
  showImport.value = !showImport.value
}
function doImport() {
  const lines = importText.value.split('\n')
  const data = {}
  lines.forEach((line) => {
    if (line.startsWith('[')) return // 忽略日期行，我们保留当前日期
    const [key, value] = line.split('=')
    if (key && value !== undefined) {
      data[key.trim()] = value.trim()
    }
  })

  const booleanFields = ['english_review', 'english_course', 'writing_ideas_done']
  const numberFields = [
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
    'writing_revise_unit'
  ]
  const maxByField = {
    english_words_groups: 3,
    english_exam_count: 6,
    agent_work_units: 99,
    agent_exercise_groups: 6,
    agent_knowledge_units: 6,
    agent_report_count: 3,
    extra_agent_units: 99,
    painting_practice_unit: 99,
    painting_stage_unit: 99,
    writing_draft_unit: 99,
    writing_revise_unit: 99,
  }
  let adjustedCount = 0

  // 更新状态（仅更新存在的字段）
  Object.keys(data).forEach((key) => {
    if (key in state) {
      if (booleanFields.includes(key)) {
        state[key] = Number(data[key]) > 0 || data[key] === 'true'
        return
      }
      if (numberFields.includes(key)) {
        const numberValue = Number(data[key])
        let normalizedValue = Number.isFinite(numberValue) && numberValue > 0 ? Math.floor(numberValue) : 0
        const max = maxByField[key]
        if (max !== undefined && normalizedValue > max) {
          normalizedValue = max
          adjustedCount += 1
        }
        state[key] = normalizedValue
      }
    }
  })

  showImport.value = false
  importText.value = ''
  hint.value = adjustedCount > 0
    ? `导入完成，已自动修正 ${adjustedCount} 项超限值。`
    : '导入完成，已应用到当前日期。'
}
</script>

<style scoped>
.page-wrap {
  min-height: 100vh;
  padding: 16px;
}

.container {
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  gap: 14px;
}

.page-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.header-card,
.summary-card,
.section-card {
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(203, 213, 225, 0.8);
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.08);
  padding: 14px;
}

.header-card {
  display: grid;
  gap: 12px;
}

h1 {
  margin: 0 0 6px;
  font-size: clamp(22px, 4.2vw, 30px);
}

.subtitle {
  margin: 0;
  color: #475569;
  font-size: 14px;
}

.date-picker {
  display: grid;
  gap: 6px;
  font-size: 14px;
  color: #334155;
}

.date-picker input {
  height: 40px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  padding: 0 10px;
  font: inherit;
}

h2,
h3 {
  margin: 0 0 10px;
}

.score-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.score-item {
  border-radius: 12px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: grid;
  gap: 3px;
}

.score-item.total {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.label {
  color: #64748b;
  font-size: 13px;
}

.score-item strong {
  font-size: 19px;
  color: #0f172a;
}

.score-item small {
  color: #64748b;
  font-size: 12px;
}

.panel-grid {
  display: grid;
  gap: 12px;
}

fieldset {
  margin: 0;
  padding: 12px;
  border: 1px solid #dbe4ef;
  border-radius: 12px;
  background: #f8fafc;
}

legend {
  font-weight: 600;
  padding: 0 4px;
  color: #334155;
}

.line-checkbox,
.line-input {
  display: grid;
  gap: 6px;
  margin-bottom: 10px;
  color: #0f172a;
}

.line-checkbox {
  grid-template-columns: 20px 1fr auto;
  align-items: center;
}

.line-input input {
  width: 100%;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  padding: 0 10px;
  font: inherit;
}

.stepper {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
}

.stepper input {
  width: 100%;
  min-width: 0;
  text-align: center;
}

.stepper-buttons {
  display: grid;
  grid-template-columns: 44px 44px;
  gap: 6px;
}

.step-btn {
  height: 40px;
  min-height: 40px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #eef2ff;
  color: #1e3a8a;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.line-input small {
  color: #64748b;
  font-size: 12px;
}

.score-tag {
  font-size: 12px;
  color: #1d4ed8;
  background: #dbeafe;
  border-radius: 999px;
  padding: 2px 8px;
}

.cap-note {
  margin: 2px 0 0;
  font-size: 13px;
  color: #475569;
}

.goals-grid {
  display: grid;
  gap: 6px;
}

.goal-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #dbe4ef;
  border-radius: 10px;
  background: #f8fafc;
  padding: 10px;
  gap: 10px;
}

.goal-row.done {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.goal-meta {
  text-align: right;
  display: grid;
}

.goal-meta small {
  color: #64748b;
}

.goal-meta strong {
  font-size: 13px;
  color: #1e40af;
}

.settlement-narrative {
  margin: 0 0 14px;
  padding: 12px;
  border-radius: 10px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-size: 14px;
  line-height: 1.55;
}

.actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.btn {
  height: 40px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  font: inherit;
  cursor: pointer;
}

.btn.primary {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
}

.btn.danger {
  background: #dc2626;
  border-color: #dc2626;
  color: #fff;
}

.hint {
  margin: 10px 0 0;
  color: #1d4ed8;
  font-size: 14px;
}

textarea {
  margin-top: 10px;
  width: 100%;
  min-height: 140px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  padding: 10px;
  font: inherit;
  resize: vertical;
}

.import-confirm {
  margin-top: 10px;
  width: 100%;
}

@media (min-width: 768px) {
  .page-wrap {
    padding: 24px;
  }

  .header-card {
    grid-template-columns: 1fr 280px;
    align-items: end;
  }

  .score-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .panel-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .optional-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .actions {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>