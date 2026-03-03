<template>
  <section class="stats-layout">
    <section class="stats-card">
      <h2>历史数据输入</h2>
      <p class="desc">粘贴多天导出文本，按 `[YYYY-MM-DD]` 分段自动解析并统计。</p>
      <textarea
        v-model="rawText"
        placeholder="[2026-03-01]
english_words_groups=4
english_review=10
english_course=20
english_exam_count=3
coding_work_units=5
...

[2026-03-02]
..."
      />
      <div class="tool-row">
        <button class="btn" @click="rawText = ''">清空输入</button>
        <span>已解析 {{ records.length }} 天</span>
      </div>
    </section>

    <section class="stats-card">
      <h2>趋势图</h2>
      <p v-if="chartHint" class="chart-hint">{{ chartHint }}</p>
      <div class="series-grid">
        <label v-for="item in seriesOptions" :key="item.key" class="series-item">
          <input type="checkbox" v-model="selectedSeries[item.key]" />
          <span>{{ item.label }}</span>
        </label>
      </div>
      <div class="tool-row">
        <button class="btn" @click="copyChartToClipboard">复制图表到剪贴板</button>
      </div>
      <div class="chart-wrap">
        <canvas ref="chartCanvas" />
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import Chart from 'chart.js/auto'

const rawText = ref('')
const chartCanvas = ref(null)
const chartHint = ref('')
let chartInstance = null

const seriesOptions = [
  { key: 'total', label: '总分', color: '#1d4ed8' },
  { key: 'must', label: '必须部分', color: '#7c3aed' },
  { key: 'english', label: '英语', color: '#0f766e' },
  { key: 'coding', label: '编程（时长分+额外分）', color: '#ca8a04' },
  { key: 'optional', label: '可选部分', color: '#dc2626' },
  { key: 'painting', label: '绘画', color: '#db2777' },
  { key: 'writing', label: '文学创作', color: '#059669' },
  { key: 'codingHalfHours', label: '编程时长（半小时单元）', color: '#0369a1' },
  { key: 'wordsCount', label: '背词数量（词）', color: '#65a30d' },
]

const selectedSeries = ref({
  total: true,
  must: true,
  english: false,
  coding: false,
  optional: true,
  painting: false,
  writing: false,
  codingHalfHours: false,
  wordsCount: false,
})

function toInt(value) {
  const num = Number(value)
  if (!Number.isFinite(num) || num < 0) return 0
  return Math.floor(num)
}

function toBoolScore(value) {
  if (value === true || value === 'true') return true
  return toInt(value) > 0
}

function parseRecordMap(text) {
  const lines = text.split('\n')
  const list = []
  let current = null

  lines.forEach((rawLine) => {
    const line = rawLine.trim()
    if (!line) return

    if (line.startsWith('[') && line.endsWith(']')) {
      if (current?.date) list.push(current)
      current = { date: line.slice(1, -1) }
      return
    }

    if (!current) return
    const [key, value] = line.split('=')
    if (!key || value === undefined) return
    current[key.trim()] = value.trim()
  })

  if (current?.date) list.push(current)
  return list
}

function calcMetrics(data) {
  const englishWordsGroups =
    data.english_words_groups !== undefined
      ? toInt(data.english_words_groups)
      : (toInt(data.english_words) > 0 ? 4 : 0)

  const englishReview = toBoolScore(data.english_review) ? 10 : 0
  const englishCourse = toBoolScore(data.english_course) ? 20 : 0
  const englishExamCount =
    data.english_exam_count !== undefined
      ? toInt(data.english_exam_count)
      : (toInt(data.english_exam) > 0 ? 2 : 0)

  const englishWordsScore = Math.min(englishWordsGroups * 5, 20)
  const englishExamScore = Math.min(englishExamCount * 5, 30)
  const english = Math.min(englishWordsScore + englishReview + englishCourse + englishExamScore, 60)
  const wordsCount = englishWordsGroups * 20

  const codingWorkUnits =
    data.coding_work_units !== undefined
      ? toInt(data.coding_work_units)
      : Math.floor(toInt(data.coding_duration) / 30)
  const codingDurationScore = Math.min(codingWorkUnits * 5, 30)
  const codingExtraRaw =
    toInt(data.coding_extra_blog) * 10 +
    toInt(data.coding_extra_debug) * 5 +
    toInt(data.coding_extra_opt) * 5
  const codingExtra = Math.min(codingExtraRaw, 10)
  const coding = Math.min(codingDurationScore + codingExtra, 40)

  const extraCodingUnits =
    data.extra_coding_units !== undefined
      ? toInt(data.extra_coding_units)
      : Math.floor(toInt(data.extra_coding_duration) / 30)
  const extraCoding = Math.min(extraCodingUnits * 5, 30)
  const codingHalfHours = codingWorkUnits + extraCodingUnits
  const painting = toInt(data.painting_practice_unit) * 10 + toInt(data.painting_stage_unit) * 10
  const writing = toInt(data.writing_draft_unit) * 30 + toInt(data.writing_revise_unit) * 20

  const optionalRaw = extraCoding + painting + writing
  const optional = Math.min(optionalRaw, 60)
  const must = english + coding
  const total = must + optional
  // 统计口径：编程基础分（含博客/难点/优化）+ 超额编程分
  const codingWithExtra = coding + extraCoding

  return {
    english,
    coding: codingWithExtra,
    optional,
    painting,
    writing,
    must,
    total,
    codingHalfHours,
    wordsCount
  }
}

const records = computed(() => {
  const maps = parseRecordMap(rawText.value)
  return maps
    .map((row) => ({ date: row.date, ...calcMetrics(row) }))
    .sort((a, b) => a.date.localeCompare(b.date))
})

function renderChart() {
  if (!chartCanvas.value) return
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  if (!records.value.length) return

  const labels = records.value.map((item) => item.date)
  const datasets = seriesOptions
    .filter((item) => selectedSeries.value[item.key])
    .map((item) => ({
      label: item.label,
      data: records.value.map((row) => row[item.key]),
      borderColor: item.color,
      backgroundColor: `${item.color}33`,
      borderWidth: 2,
      tension: 0.25,
      pointRadius: 2,
      fill: false,
      yAxisID: item.key === 'codingHalfHours' ? 'y1' : 'y',
    }))

  if (!datasets.length) return
  const hasHalfHourSeries = datasets.some((item) => item.yAxisID === 'y1')

  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'bottom' } },
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          title: { display: true, text: '分数 / 数量' },
        },
        y1: {
          type: 'linear',
          position: 'right',
          display: hasHalfHourSeries,
          beginAtZero: true,
          title: { display: hasHalfHourSeries, text: '编程时长（半小时单元）' },
          grid: {
            drawOnChartArea: false,
          },
        },
      }
    },
  })
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

async function copyChartToClipboard() {
  if (!chartCanvas.value || !chartInstance) {
    chartHint.value = '暂无图表可复制，请先粘贴并解析历史数据。'
    return
  }

  if (!navigator.clipboard || !window.ClipboardItem) {
    chartHint.value = '当前浏览器不支持图片剪贴板，请尝试最新版 Chrome/Edge。'
    return
  }

  const blob = await canvasToBlob(chartCanvas.value)
  if (!blob) {
    chartHint.value = '图表转图片失败，请重试。'
    return
  }

  try {
    await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })])
    chartHint.value = '图表已复制到剪贴板，可直接粘贴到聊天或文档。'
  } catch (error) {
    chartHint.value = '复制失败：请在 HTTPS 页面中使用，并允许剪贴板权限。'
  }
}

watch([records, selectedSeries], async () => {
  await nextTick()
  renderChart()
}, { deep: true, immediate: true })

onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>

<style scoped>
.stats-layout {
  display: grid;
  gap: 14px;
}

.stats-card {
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(203, 213, 225, 0.8);
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.08);
  padding: 14px;
}

h2 {
  margin: 0 0 10px;
}

.desc {
  margin: 0 0 10px;
  color: #475569;
  font-size: 14px;
}

.chart-hint {
  margin: 0 0 10px;
  color: #1d4ed8;
  font-size: 14px;
}

textarea {
  width: 100%;
  min-height: 180px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  padding: 10px;
  font: inherit;
  resize: vertical;
}

.tool-row {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #475569;
  font-size: 14px;
}

.btn {
  height: 36px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  padding: 0 12px;
  cursor: pointer;
}

.series-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.series-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-wrap {
  height: 360px;
}

@media (min-width: 900px) {
  .series-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
