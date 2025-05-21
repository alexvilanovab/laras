import { useInstruments } from '../hooks/useInstruments'
import { useMaxSteps } from '../hooks/useMaxSteps'
import { type Score, type Section, type SectionData } from '../models/types'
import { createScoreTimeline, splitSectionData } from '../utils/score'
import cn from 'classnames'
import { useState, type JSX, memo, useCallback, useMemo } from 'react'
import * as Tone from 'tone'

const ScoreHeader = memo(function ScoreHeader({ title, composer }: { title: string; composer?: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center">
      <div className="text-xl italic">{title ? title : '<untitled>'}</div>
      {composer && (
        <div>
          <span>by</span>
          <span className="font-bold"> {composer}</span>
        </div>
      )}
    </div>
  )
})

function ScoreSectionHeader({
  name,
  fullDisplay,
  onToggleDisplay,
}: {
  name: string
  fullDisplay: boolean
  onToggleDisplay: () => void
}): JSX.Element {
  return (
    <div className="flex justify-between border-b font-bold">
      <span className="cursor-pointer select-none">{name}</span>
      <div className="flex items-center gap-2">
        <span onClick={onToggleDisplay} className="cursor-pointer font-mono select-none">
          {fullDisplay ? '-' : '+'}
        </span>
      </div>
    </div>
  )
}

function ScoreSectionData({
  sectionData,
  fullDisplay,
  isFirst = false,
  isLast = false,
  cursorStep,
  setCursorStep,
}: {
  sectionData: SectionData[]
  fullDisplay: boolean
  isFirst?: boolean
  isLast?: boolean
  cursorStep?: number
  setCursorStep: (step: number) => void
}): JSX.Element {
  return (
    <div className="flex flex-col">
      {sectionData.map((data, i) => (
        <div key={`${i}-${data.label}-${i}`} className="flex items-center text-xs select-none">
          <div className="sticky left-0 flex h-4 w-8 flex-shrink-0 items-center bg-amber-100 font-bold">
            {data.label}
          </div>

          <div className="flex">
            {data.value.split('').map((char, j) => {
              return (
                <span
                  key={j}
                  onClick={() => setCursorStep(j)}
                  className={cn(
                    'flex h-4 w-4 cursor-pointer items-center justify-center font-mono',
                    j === 0 && (!fullDisplay || isFirst)
                      ? 'border-l'
                      : j % 4 === 0 && 'border-l border-dashed border-black/20',
                    cursorStep === j && 'bg-yellow-300',
                  )}
                >
                  {char}
                </span>
              )
            })}
            <span
              className={cn(
                'flex h-4 w-4 items-center justify-center border-l',
                fullDisplay && !isLast && 'border-dashed border-black/20',
              )}
            ></span>
          </div>
        </div>
      ))}
    </div>
  )
}

const ScoreSection = memo(function ScoreSection({
  section,
  maxSteps,
  cursorStep,
  setCursorStep,
}: {
  section: Section
  maxSteps: number
  cursorStep?: number
  setCursorStep: (step: number) => void
}): JSX.Element {
  const [fullDisplay, setFullDisplay] = useState(true)
  const dataChunks = splitSectionData(section.data, maxSteps)

  return (
    <div className="overflow-hidden text-sm">
      {dataChunks.length === 0 ? null : (
        <div className="flex flex-col">
          <ScoreSectionHeader
            fullDisplay={fullDisplay}
            onToggleDisplay={() => setFullDisplay((prev) => !prev)}
            name={section.title}
          />
          {fullDisplay ? (
            dataChunks.map((data, i) => {
              const chunkStart = i * maxSteps
              const chunkEnd = chunkStart + maxSteps
              const chunkCursorStep =
                cursorStep !== undefined && cursorStep >= chunkStart && cursorStep < chunkEnd
                  ? cursorStep - chunkStart
                  : undefined
              const setChunkCursorStep = (chunkStep: number) => setCursorStep(chunkStart + chunkStep)
              return (
                <div key={i} className="flex flex-col">
                  <ScoreSectionData
                    sectionData={data}
                    fullDisplay={fullDisplay}
                    isFirst={i === 0}
                    isLast={i === dataChunks.length - 1}
                    cursorStep={chunkCursorStep}
                    setCursorStep={setChunkCursorStep}
                  />
                  {i < dataChunks.length - 1 && <hr className="border-black/20" />}
                </div>
              )
            })
          ) : (
            <div className="custom-scrollbar overflow-scroll">
              <ScoreSectionData
                sectionData={section.data}
                fullDisplay={fullDisplay}
                cursorStep={cursorStep}
                setCursorStep={setCursorStep}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
})

type AudioState = 'false' | 'true' | 'wait'

export default function ScoreRender({ score }: { score: Score }): JSX.Element {
  const { ref: scoreSectionRef, maxSteps } = useMaxSteps()

  const [audioStarted, setAudioStarted] = useState<AudioState>('false')
  const [playing, setPlaying] = useState<boolean>(false)

  const [cursor, setCursor] = useState<number>(0)
  const updateCursor = useCallback(
    (sectionID: number, step: number) => setCursor(timeline.findIndex((p) => p.sectionId === sectionID) + step),
    [],
  )
  const updateCursorCallbacks = useMemo(() => {
    const callbacks: Record<number, (step: number) => void> = {}
    score.sections.forEach((section) => (callbacks[section.id] = (step: number) => updateCursor(section.id, step)))
    return callbacks
  }, [score.sections, updateCursor])

  const timeline = useMemo(() => createScoreTimeline(score), [score])
  const { playInstrument, muteAll } = useInstruments()

  async function playStop() {
    if (audioStarted === 'false') {
      Tone.start()
      setAudioStarted('wait')
      await Tone.loaded()
      setAudioStarted('true')
      startLoop()
    } else {
      if (playing) stopLoop()
      else startLoop()
    }
  }

  const startLoop = () => {
    const accentedChars = new Set(['Í', 'Ó', 'É', 'Ú', 'Á', 'í', 'ó', 'é', 'ú', 'á', 'ć'])
    const delayOffset = Tone.Time('32n')
    muteAll()
    Tone.getTransport().cancel()
    Tone.getTransport().scheduleRepeat(
      (t) => {
        setCursor((pC) => {
          const timelinePoint = timeline[pC]
          timelinePoint.instrumentActions.forEach((action) => {
            let triggerTime = t
            let char = action.value
            if (!['kkr', 'krw', 'krl'].includes(action.label) && accentedChars.has(action.value)) {
              triggerTime += delayOffset.toSeconds()
              char = char.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            }
            playInstrument(action.label, char, triggerTime)
          })
          if (timelinePoint.tempo !== Tone.getTransport().bpm.value) Tone.getTransport().bpm.value = timelinePoint.tempo
          if (pC >= timeline.length - 1) {
            stopLoop()
            return 0
          }
          return pC + 1
        })
      },
      '16n',
      0,
    )
    if (Tone.getTransport().state !== 'started') Tone.getTransport().start()
    setPlaying(true)
  }

  const stopLoop = () => {
    muteAll()
    Tone.getTransport().cancel()
    setPlaying(false)
  }

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="custom-scrollbar flex h-full flex-col overflow-scroll bg-amber-100">
        <div className="my-4">
          <ScoreHeader title={score.title} composer={score.composer} />
        </div>

        <div ref={scoreSectionRef} className="mx-4">
          {score.sections.map((section) => (
            <div key={section.id} className="mb-4">
              <ScoreSection
                section={section}
                maxSteps={maxSteps}
                cursorStep={timeline[cursor]?.sectionId === section.id ? timeline[cursor].sectionStep : undefined}
                setCursorStep={updateCursorCallbacks[section.id]}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1 border-t bg-amber-100 px-4 pt-3 pb-4 text-xs">
        <div className="flex justify-center">
          <span className="italic">{score.title}</span>
          <span className="mx-1 text-black/40">–</span>
          <span>{score.composer}</span>
        </div>
        <div className="flex w-full">
          <div className="flex w-full items-center justify-center gap-2 select-none">
            <div className="h-4 w-4 flex-shrink-0">
              <img
                onClick={() => playStop()}
                src={`icons/${playing ? 'pause' : 'play'}_icon.svg`}
                className="h-full w-full cursor-pointer select-none"
                alt="Play/Stop"
              />
            </div>
            <span className="flex w-12 flex-shrink-0 justify-center">00:00</span>
            <div className="flex w-full cursor-pointer items-center py-1">
              <hr className="w-full border-1" />
            </div>
            <span className="flex w-12 flex-shrink-0 justify-center">00:00</span>
          </div>
        </div>
      </div>
    </div>
  )
}
