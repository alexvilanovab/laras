import { parser } from '../grammar/laras'
import { type Section, type SectionData, type Score } from '../models/types'
import type { SyntaxNode } from '@lezer/common'

export function parseScore(input: string): Score {
  const tree = parser.parse(input)

  const score: Score = { title: '', composer: '', sections: [] }

  let currentSection: Section | null = null

  const getText = (node: SyntaxNode): string => input.slice(node.from, node.to)
  const cleanString = (str: string): string => str.slice(1, -1)
  const cleanCode = (str: string): string => str.slice(1, -1)

  const traverse = (node: SyntaxNode) => {
    switch (node.name) {
      case 'MetadataValue': {
        const name = getText(node.getChild('Name')!).toLowerCase()
        const value = cleanString(getText(node.getChild('String')!))
        if (name === 'title') score.title = value
        if (name === 'composer') score.composer = value
        break
      }
      case 'SectionHeader': {
        const title = cleanString(getText(node.getChild('String')!))
        const tempo = parseInt(getText(node.getChild('Number')!))
        currentSection = { id: score.sections.length, title: title, tempo: tempo, data: [] }
        score.sections.push(currentSection)
        break
      }
      case 'SectionData': {
        if (!currentSection) return
        const sectionData: SectionData = {
          label: getText(node.getChild('Name')!),
          value: cleanCode(getText(node.getChild('Code')!)),
        }
        currentSection.data.push(sectionData)
        break
      }
    }

    let child = node.firstChild
    while (child) {
      traverse(child)
      child = child.nextSibling
    }
  }

  traverse(tree.topNode)

  return score
}

export function splitSectionData(data: SectionData[], steps: number): SectionData[][] {
  if (steps <= 0 || data.length === 0) return []

  const labels = data.map(({ label }) => label)
  const values = data.map(({ value }) => value)

  if (values.length === 0) return []

  const dataLength = values[0].length
  const chunks: SectionData[][] = []

  for (let i = 0; i < dataLength; i += steps) {
    const chunk: SectionData[] = labels.map((label, j) => {
      const end = Math.min(i + steps, values[j].length)
      const value = values[j].substring(i, end)

      return { label, value }
    })
    chunks.push(chunk)
  }

  return chunks
}

type InstrumentAction = {
  label: string
  value: string
}

export type ScoreTimelinePoint = {
  timelineStep: number
  sectionId: number
  sectionStep: number
  time: number
  tempo: number
  instrumentActions: InstrumentAction[]
}

export type ScoreTimeline = ScoreTimelinePoint[]

export function createScoreTimeline(score: Score): ScoreTimelinePoint[] {
  const timeline: ScoreTimelinePoint[] = []
  let currentTime = 0
  let timelineStep = 0

  score.sections.forEach((section) => {
    const sectionBpm = section.tempo || 120
    const secondsPerStep = 60 / sectionBpm
    const maxSteps = section.data.reduce((max, data) => Math.max(max, data.value.length), 0)

    for (let step = 0; step < maxSteps; step++) {
      const instrumentActions: InstrumentAction[] = section.data
        .filter((data) => data.value[step] && data.value[step] !== ' ')
        .map((data) => ({ label: data.label, value: data.value[step] }))

      timeline.push({
        timelineStep: timelineStep,
        sectionId: section.id,
        sectionStep: step,
        time: currentTime,
        tempo: sectionBpm,
        instrumentActions,
      })

      currentTime += secondsPerStep
      timelineStep++
    }
  })

  return timeline
}
