type IExample = {
  corrected: string
  origin: string
}

type ITag = {
  category: string
  example: IExample[]
  skill: string
  skill_ko: string
}

type IMatch = {
  feedback: string
  feedback_ko: string
  length: number
  offset: number
  tag: ITag[]
  value: string
}

type IResultGEC = {
  correct_text: string
  matches: IMatch[]
  text: string
}

export type { IResultGEC }
