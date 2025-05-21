export type Instrument = {
  id: string
  name: string
  alphabet: string[]
}

export type SectionData = {
  label: string
  value: string
}

export type Section = {
  id: number
  title: string
  tempo: number
  data: SectionData[]
}

export type Score = {
  title: string
  composer: string
  sections: Section[]
}
