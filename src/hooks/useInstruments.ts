import { useCallback, useMemo, useState } from 'react'
import * as Tone from 'tone'

const SOUNDS_FOLDER = 'sounds/'
const NOTES = ['D4', 'E4', 'G#4', 'A4', 'C#4', 'D5', 'E5', 'G#5', 'A5', 'C#6']

type InstrumentConfig = {
  alphabet: string[]
  samples: string[]
  volume: number
}

const instrumentConfigs: Record<string, InstrumentConfig> = {
  r1: {
    alphabet: ['E', 'U', 'A', 'I', 'O', 'e'],
    samples: ['r_e.mp3', 'r_u.mp3', 'r_a.mp3', 'r_i.mp3', 'r_o.mp3', 'r_e-h.mp3'],
    volume: -24,
  },
  r2: {
    alphabet: ['A', 'I', 'O', 'e', 'u', 'a'],
    samples: ['r_a.mp3', 'r_i.mp3', 'r_o.mp3', 'r_e-h.mp3', 'r_u-h.mp3', 'r_a-h.mp3'],
    volume: -24,
  },
  r3: {
    alphabet: ['e', 'u', 'a', 'i', 'o'],
    samples: ['r_e-h.mp3', 'r_u-h.mp3', 'r_a-h.mp3', 'r_i-h.mp3', 'r_o-h.mp3'],
    volume: -24,
  },
  r4: {
    alphabet: ['U', 'a', 'i', 'o', 'e', 'u'],
    samples: ['r_u-h.mp3', 'r_a-h.mp3', 'r_i-h.mp3', 'r_o-h.mp3', 'r_e-hh.mp3', 'r_u-hh.mp3'],
    volume: -24,
  },
  rs2: {
    alphabet: ['a', 'i', 'o', 'e', 'u'],
    samples: ['r_a.mp3', 'r_i.mp3', 'r_o.mp3', 'r_e-h.mp3', 'r_u-h.mp3'],
    volume: -24,
  },
  rs4: {
    alphabet: ['a', 'i', 'o', 'e', 'u'],
    samples: ['r_a-h.mp3', 'r_i-h.mp3', 'r_o-h.mp3', 'r_e-hh.mp3', 'r_u-hh.mp3'],
    volume: -24,
  },
  rp1: {
    alphabet: ['e', 'u', 'a', 'i', 'o'],
    samples: ['r_e.mp3', 'r_u.mp3', 'r_a.mp3', 'r_i.mp3', 'r_o.mp3'],
    volume: -24,
  },
  rp3: {
    alphabet: ['e', 'u', 'a', 'i', 'o'],
    samples: ['r_e-h.mp3', 'r_u-h.mp3', 'r_a-h.mp3', 'r_i-h.mp3', 'r_o-h.mp3'],
    volume: -24,
  },
  ks: {
    alphabet: ['O', 'E', 'U', 'A', 'I', 'o', 'e', 'u', 'a', 'i'],
    samples: ['gk_o.mp3','gk_e.mp3','gk_u.mp3','gk_a.mp3','gk_i.mp3','gk_o-h.mp3','gk_e-h.mp3','gk_u-h.mp3','gk_a-h.mp3','gk_i-h.mp3'], // prettier-ignore
    volume: -28,
  },
  kp: {
    alphabet: ['O', 'E', 'U', 'A', 'I', 'o', 'e', 'u', 'a', 'i'],
    samples: ['gk_o.mp3','gk_e.mp3','gk_u.mp3','gk_a.mp3','gk_i.mp3','gk_o-h.mp3','gk_e-h.mp3','gk_u-h.mp3','gk_a-h.mp3','gk_i-h.mp3'], // prettier-ignore
    volume: -28,
  },
  ps: {
    alphabet: ['O', 'E', 'U', 'A', 'I', 'o', 'e', 'u', 'a', 'i'],
    samples: ['gp_o.mp3','gp_e.mp3','gp_u.mp3','gp_a.mp3','gp_i.mp3','gp_o-h.mp3','gp_e-h.mp3','gp_u-h.mp3','gp_a-h.mp3','gp_i-h.mp3'], // prettier-ignore
    volume: -28,
  },
  pp: {
    alphabet: ['O', 'E', 'U', 'A', 'I', 'o', 'e', 'u', 'a', 'i'],
    samples: ['gp_o.mp3','gp_e.mp3','gp_u.mp3','gp_a.mp3','gp_i.mp3','gp_o-h.mp3','gp_e-h.mp3','gp_u-h.mp3','gp_a-h.mp3','gp_i-h.mp3'], // prettier-ignore
    volume: -28,
  },
  gr1: {
    alphabet: ['E', 'U', 'A', 'I', 'o', 'e', 'u', 'a', 'i'],
    samples: ['gr_e.mp3','gr_u.mp3','gr_a.mp3','gr_i.mp3','gr_o.mp3','gr_e-h.mp3','gr_u-h.mp3','gr_a-h.mp3','gr_i-h.mp3'], // prettier-ignore
    volume: -26,
  },
  gr2: {
    alphabet: ['E', 'U', 'A', 'I', 'o', 'e', 'u', 'a', 'i'],
    samples: ['gr_e-h.mp3','gr_u-h.mp3','gr_a-h.mp3','gr_i-h.mp3','gr_o-h.mp3','gr_e-hh.mp3','gr_u-hh.mp3','gr_a-hh.mp3','gr_i-hh.mp3'], // prettier-ignore
    volume: -26,
  },
  u: { alphabet: [], samples: [], volume: -24 },
  t: { alphabet: [], samples: [], volume: -24 },
  p: {
    alphabet: ['U', 'A', 'i', 'o', 'e', 'u', 'a'],
    samples: ['pp_u.mp3', 'pp_a.mp3', 'pp_i.mp3', 'pp_o.mp3', 'pp_e.mp3', 'pp_u-h.mp3', 'pp_a-h.mp3'],
    volume: -22,
  },
  c: {
    alphabet: ['I', 'O', 'E', 'U', 'A'],
    samples: ['pc_i.mp3', 'pc_o.mp3', 'pc_e.mp3', 'pc_u.mp3', 'pc_a.mp3'],
    volume: -22,
  },
  j: {
    alphabet: ['I', 'O', 'E', 'U', 'A'],
    samples: ['pj_i.mp3', 'pj_o.mp3', 'pj_e.mp3', 'pj_u.mp3', 'pj_a.mp3'],
    volume: -22,
  },
  g: {
    alphabet: ['G', 'L', 'P', 't'],
    samples: ['g_g.mp3', 'g_l.mp3', 'g_p.mp3', 'g_t.mp3'],
    volume: -20,
  },
  km: { alphabet: ['x'], samples: ['km.mp3'], volume: -20 },
  kn: { alphabet: ['n'], samples: ['kn.mp3'], volume: -24 },
  cc: {
    alphabet: ['x', 'c', 'C'],
    samples: ['c_x-l.mp3', 'c_c.mp3', 'c_c-o.mp3'],
    volume: -28,
  },
  kkr: {
    alphabet: ['o', 'e', 'n', 'u', 'D', 'T', 'k', 'p', 'ḱ', 'ṕ'],
    samples: ['kkr_o.mp3','kkr_e.mp3','kkr_n.mp3','kkr_u.mp3','kkr_d.mp3','kkr_t.mp3','kkr_k.mp3','kkr_p.mp3','kkr_k-h.mp3','kkr_pak.mp3'], // prettier-ignore
    volume: -17,
  },
  krw: {
    alphabet: ['o', 'e', 'n', 'u', 'D', 'T', 'k', 'p', 'ḱ', 'ṕ'],
    samples: ['kkr_o.mp3','kkr_e.mp3','kkr_n.mp3','kkr_u.mp3','kkr_d.mp3','kkr_t.mp3','kkr_k.mp3','kkr_p.mp3','kkr_k-h.mp3','kkr_pak.mp3'], // prettier-ignore
    volume: -17,
  },
  krl: {
    alphabet: ['o', 'e', 'n', 'u', 'D', 'T', 'k', 'p', 'ḱ', 'ṕ'],
    samples: ['kkr_o.mp3','kkr_e.mp3','kkr_n.mp3','kkr_u.mp3','kkr_d.mp3','kkr_t.mp3','kkr_k.mp3','kkr_p.mp3','kkr_k-h.mp3','kkr_pak.mp3'], // prettier-ignore
    volume: -17,
  },
  tr: {
    alphabet: ['o', 'p', 'x'],
    samples: ['tr_o.mp3', 'tr_p.mp3', 'tr_x.mp3'],
    volume: -18,
  },
}

const cInstrumentConfigs: Record<string, string[]> = {
  rs: ['rs2', 'rs4'],
  rp: ['rp1', 'rp3'],
  kt: ['ks', 'kp'],
  pd: ['ps', 'pp'],
  gs: ['ks', 'ps'],
  gp: ['kp', 'pp'],
  gr: ['gr1', 'gr2'],
  ggs: ['ks', 'kp', 'ps', 'pp'],
}

export type LarasInstrument = {
  play: (note: string, time: number) => void
  mute: (time: number) => void
}

export type LarasInstruments = Record<string, LarasInstrument>

const generateMappings = (alphabet: string[]) => Object.fromEntries(alphabet.map((char, index) => [char, NOTES[index]]))

const createSampler = (samples: { [key: string]: string }, volume: number) =>
  new Tone.Sampler({ urls: samples, baseUrl: SOUNDS_FOLDER, volume }).toDestination()

const createInstrument = (key: string, samplers: Record<string, Tone.Sampler>): LarasInstrument => {
  const mapping = generateMappings(instrumentConfigs[key].alphabet)
  return {
    play: (note: string, time: number) => {
      if (mapping[note]) {
        samplers[key].releaseAll(time)
        samplers[key].triggerAttack([mapping[note]], time)
      }
    },
    mute: (time: number) => samplers[key].releaseAll(time),
  }
}

const createCInstrument = (components: string[], samplers: Record<string, Tone.Sampler>): LarasInstrument => {
  const allMappings: Record<string, Record<string, string>> = {}

  components.forEach((component) => {
    if (instrumentConfigs[component]?.alphabet.length) {
      allMappings[component] = generateMappings(instrumentConfigs[component].alphabet)
    }
  })

  return {
    play: (note: string, time: number) => {
      components.forEach((component) => {
        if (allMappings[component]?.[note]) {
          samplers[component].releaseAll(time)
          samplers[component].triggerAttack([allMappings[component][note]], time)
        }
      })
    },
    mute: (time: number) => {
      components.forEach((component) => {
        if (samplers[component]) samplers[component].releaseAll(time)
      })
    },
  }
}

export const useInstruments = () => {
  const [mutedInstruments, setMutedInstruments] = useState<Record<string, boolean>>({})

  const samplers = useMemo(() => {
    return Object.fromEntries(
      Object.entries(instrumentConfigs).map(([key, config]) => [
        key,
        createSampler(Object.fromEntries(config.samples.map((sample, index) => [NOTES[index], sample])), config.volume),
      ]),
    )
  }, [])

  const instruments: LarasInstruments = {}

  Object.keys(instrumentConfigs).forEach((key) => (instruments[key] = createInstrument(key, samplers)))
  Object.entries(cInstrumentConfigs).forEach(
    ([key, components]) => (instruments[key] = createCInstrument(components, samplers)),
  )

  const playInstrument = useCallback(
    (label: string, note: string, time: number) => {
      if (!mutedInstruments[label] && instruments[label]) {
        if (note === '.') instruments[label].mute(time)
        else instruments[label].play(note, time)
      }
    },
    [mutedInstruments, instruments],
  )

  const muteInstrument = useCallback(
    (label: string) => setMutedInstruments((prev) => ({ ...prev, [label]: !prev[label] })),
    [],
  )

  const muteAll = useCallback(
    (time: number = Tone.now()) => Object.keys(instruments).forEach((label) => instruments[label].mute(time)),
    [instruments],
  )

  return {
    playInstrument,
    muteInstrument,
    muteAll,
    mutedInstruments,
  }
}
