<template>
  <div class="page-wrap">
    <main class="container">
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
            <span class="label">编程</span>
            <strong>{{ scores.coding }} / 40</strong>
          </div>
          <div class="score-item">
            <span class="label">可选</span>
            <strong>{{ scores.optional }} / 60</strong>
            <small v-if="scores.optionalRaw > 60">原始 {{ scores.optionalRaw }}，已封顶</small>
          </div>
          <div class="score-item total">
            <span class="label">总分</span>
            <strong>{{ scores.total }} / 160</strong>
          </div>
        </div>
      </section>

      <section class="section-card">
        <h3>必须部分（目标 100 分）</h3>
        <div class="panel-grid">
          <fieldset>
            <legend>一、英语（60分）</legend>
            <label class="line-checkbox">
              <input type="checkbox" v-model="state.english_words" />
              <span>背新词 80 个（20分）</span>
              <strong class="score-tag">{{ itemScores.englishWords }} 分</strong>
            </label>
            <label class="line-checkbox">
              <input type="checkbox" v-model="state.english_review" />
              <span>复习旧词（10分）</span>
              <strong class="score-tag">{{ itemScores.englishReview }} 分</strong>
            </label>
            <label class="line-checkbox">
              <input type="checkbox" v-model="state.english_course" />
              <span>看刘晓燕课程 1 节（20分）</span>
              <strong class="score-tag">{{ itemScores.englishCourse }} 分</strong>
            </label>
            <label class="line-checkbox">
              <input type="checkbox" v-model="state.english_exam" />
              <span>做真题练习 2 大题（10分）</span>
              <strong class="score-tag">{{ itemScores.englishExam }} 分</strong>
            </label>
          </fieldset>

          <fieldset>
            <legend>二、编程（40分）</legend>
            <label class="line-input">
              <span>深度工作时长（分钟）</span>
              <input type="number" v-model.number="state.coding_duration" min="0" step="30" />
              <small>每 30 分钟 5 分，上限 30 分；当前 {{ itemScores.codingDuration }} 分</small>
            </label>
            <label class="line-input">
              <span>博客/笔记（篇）</span>
              <input type="number" v-model.number="state.coding_extra_blog" min="0" />
              <small>10 分/篇；当前 {{ itemScores.codingBlog }} 分（参与三项合并封顶）</small>
            </label>
            <label class="line-input">
              <span>解决技术难点（个）</span>
              <input type="number" v-model.number="state.coding_extra_debug" min="0" />
              <small>5 分/个；当前 {{ itemScores.codingDebug }} 分（参与三项合并封顶）</small>
            </label>
            <label class="line-input">
              <span>优化细节（处）</span>
              <input type="number" v-model.number="state.coding_extra_opt" min="0" />
              <small>5 分/处；当前 {{ itemScores.codingOpt }} 分（参与三项合并封顶）</small>
            </label>
            <p class="cap-note">
              三项合计：原始 {{ itemScores.codingExtraRaw }} 分，计入 {{ itemScores.codingExtra }} / 10 分（封顶）
            </p>
          </fieldset>
        </div>
      </section>

      <section class="section-card">
        <h3>可选部分（封顶 60 分）</h3>
        <div class="panel-grid optional-grid">
          <fieldset>
            <legend>三、超额编程</legend>
            <label class="line-input">
              <span>第 4 小时及以后深度工作（分钟）</span>
              <input type="number" v-model.number="state.extra_coding_duration" min="0" step="30" />
              <small>每 30 分钟 5 分，上限 30 分；当前 {{ itemScores.extraCoding }} 分</small>
            </label>
          </fieldset>

          <fieldset>
            <legend>四、绘画</legend>
            <label class="line-input">
              <span>练习单元（个）</span>
              <input type="number" v-model.number="state.painting_practice_unit" min="0" />
              <small>10 分/个；当前 {{ itemScores.paintingPractice }} 分</small>
            </label>
            <label class="line-input">
              <span>作品阶段单元（个）</span>
              <input type="number" v-model.number="state.painting_stage_unit" min="0" />
              <small>10 分/个；当前 {{ itemScores.paintingStage }} 分</small>
            </label>
          </fieldset>

          <fieldset>
            <legend>五、文学创作</legend>
            <label class="line-input">
              <span>初创单元（个）</span>
              <input type="number" v-model.number="state.writing_draft_unit" min="0" />
              <small>30 分/个；当前 {{ itemScores.writingDraft }} 分</small>
            </label>
            <label class="line-input">
              <span>精修单元（个）</span>
              <input type="number" v-model.number="state.writing_revise_unit" min="0" />
              <small>20 分/个；当前 {{ itemScores.writingRevise }} 分</small>
            </label>
          </fieldset>
        </div>
      </section>

      <section class="section-card">
        <h3>睡前结算（自动计算）</h3>
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
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useProgressStore } from './stores/useProgressStore'

const { state, scores, reset } = useProgressStore()

function handleDateChange() {
  // 已移除本地化存储能力，切换日期时仅刷新为空白记录
  reset(state.date)
  hint.value = `已切换到 ${state.date}。`
}

function doReset() {
  reset(state.date)
  hint.value = `已重置 ${state.date} 的记录。`
}

const hint = ref('')

const itemScores = computed(() => {
  const codingBlog = state.coding_extra_blog * 10
  const codingDebug = state.coding_extra_debug * 5
  const codingOpt = state.coding_extra_opt * 5
  const extraCoding = Math.min(Math.floor(state.extra_coding_duration / 30) * 5, 30)

  return {
    englishWords: state.english_words ? 20 : 0,
    englishReview: state.english_review ? 10 : 0,
    englishCourse: state.english_course ? 20 : 0,
    englishExam: state.english_exam ? 10 : 0,
    codingDuration: scores.value.codingDurationScore,
    codingBlog,
    codingDebug,
    codingOpt,
    codingExtraRaw: scores.value.codingExtraRaw,
    codingExtra: scores.value.codingExtra,
    extraCoding,
    paintingPractice: state.painting_practice_unit * 10,
    paintingStage: state.painting_stage_unit * 10,
    writingDraft: state.writing_draft_unit * 30,
    writingRevise: state.writing_revise_unit * 20
  }
})

const goals = computed(() => {
  const mustScore = scores.value.english + scores.value.coding
  const optionalScore = scores.value.optional
  return [
    { label: '必须部分达成60分', value: 'must60', done: mustScore >= 60, progress: `${mustScore}/100` },
    { label: '必须部分达成80分', value: 'must80', done: mustScore >= 80, progress: `${mustScore}/100` },
    { label: '必须部分达成100分', value: 'must100', done: mustScore >= 100, progress: `${mustScore}/100` },
    { label: '可选部分达成30分', value: 'opt30', done: optionalScore >= 30, progress: `${optionalScore}/60` },
    { label: '可选部分拿满60分', value: 'opt60', done: optionalScore >= 60, progress: `${optionalScore}/60` },
  ]
})

const autoGoalValues = computed(() => goals.value.filter((goal) => goal.done).map((goal) => goal.value))

function copyScoreSummary() {
  const mustScore = scores.value.english + scores.value.coding
  const reachedGoals = goals.value.filter((goal) => goal.done).map((goal) => `- ${goal.label}`)
  const pendingGoals = goals.value.filter((goal) => !goal.done).map((goal) => `- ${goal.label}`)

  const lines = [
    `【${state.date} 每日量化总结】`,
    '',
    '一、英语（60分）',
    `- 背新词 80 个：${itemScores.value.englishWords} 分`,
    `- 复习旧词：${itemScores.value.englishReview} 分`,
    `- 看刘晓燕课程 1 节：${itemScores.value.englishCourse} 分`,
    `- 做真题练习 2 大题：${itemScores.value.englishExam} 分`,
    `- 英语小计：${scores.value.english}/60`,
    '',
    '二、编程（40分）',
    `- 深度工作时长：${itemScores.value.codingDuration} 分`,
    `- 博客/笔记：${itemScores.value.codingBlog} 分`,
    `- 解决技术难点：${itemScores.value.codingDebug} 分`,
    `- 优化细节：${itemScores.value.codingOpt} 分`,
    `- 三项合计（博客+难点+优化）：原始 ${itemScores.value.codingExtraRaw} 分，计入 ${itemScores.value.codingExtra}/10`,
    `- 编程小计：${scores.value.coding}/40`,
    '',
    '三、可选部分（封顶60分）',
    `- 超额编程：${itemScores.value.extraCoding} 分`,
    `- 绘画练习单元：${itemScores.value.paintingPractice} 分`,
    `- 绘画作品阶段：${itemScores.value.paintingStage} 分`,
    `- 文学初创单元：${itemScores.value.writingDraft} 分`,
    `- 文学精修单元：${itemScores.value.writingRevise} 分`,
    `- 可选小计：${scores.value.optional}/60（原始 ${scores.value.optionalRaw}）`,
    '',
    '四、总览',
    `- 必须部分总分：${mustScore}/100`,
    `- 总分：${scores.value.total}/160`,
    '',
    '五、目标达成',
    '已达成：',
    ...(reachedGoals.length ? reachedGoals : ['- 暂无']),
    '',
    '未达成：',
    ...(pendingGoals.length ? pendingGoals : ['- 暂无']),
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
    `english_words=${state.english_words ? 20 : 0}`,
    `english_review=${state.english_review ? 10 : 0}`,
    `english_course=${state.english_course ? 20 : 0}`,
    `english_exam=${state.english_exam ? 10 : 0}`,
    `coding_duration=${state.coding_duration}`,
    `coding_extra_blog=${state.coding_extra_blog}`,
    `coding_extra_debug=${state.coding_extra_debug}`,
    `coding_extra_opt=${state.coding_extra_opt}`,
    `extra_coding_duration=${state.extra_coding_duration}`,
    `painting_practice_unit=${state.painting_practice_unit}`,
    `painting_stage_unit=${state.painting_stage_unit}`,
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

  const booleanFields = ['english_words', 'english_review', 'english_course', 'english_exam']
  const numberFields = [
    'coding_duration',
    'coding_extra_blog',
    'coding_extra_debug',
    'coding_extra_opt',
    'extra_coding_duration',
    'painting_practice_unit',
    'painting_stage_unit',
    'writing_draft_unit',
    'writing_revise_unit'
  ]

  // 更新状态（仅更新存在的字段）
  Object.keys(data).forEach((key) => {
    if (key in state) {
      if (booleanFields.includes(key)) {
        state[key] = Number(data[key]) > 0 || data[key] === 'true'
        return
      }
      if (numberFields.includes(key)) {
        const numberValue = Number(data[key])
        state[key] = Number.isFinite(numberValue) && numberValue > 0 ? Math.floor(numberValue) : 0
      }
    }
  })

  showImport.value = false
  importText.value = ''
  hint.value = '导入完成，已应用到当前日期。'
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