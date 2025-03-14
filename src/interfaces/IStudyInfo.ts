import { BookType, Mode } from './Types'

interface IStudyInfo {
  allSteps: number[]
  availableQuizStatus: 0 | 1 | 2
  isAvailableSpeaking: boolean
  isListenAndRepeat: boolean
  isSubmitPreference: boolean
  mappedStepActivity: string[]
  openSteps: number[]
  startStep: number
  isReTestYn?: boolean

  studyId: string
  studentHistoryId: string
  bookType: BookType
  mode: Mode
  isStartSpeak: boolean
  isReview: boolean
  isSuper: boolean
  isQuizLearning: boolean
  isPassedVocabularyPractice: boolean

  token: string
  isDev: boolean
  isNB: boolean

  bookmarkPage: number
  pbookStorySoundPath: string | undefined
}

export type { IStudyInfo }
