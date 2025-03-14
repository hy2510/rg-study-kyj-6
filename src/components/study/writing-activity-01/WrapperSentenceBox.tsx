import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { SentenceState } from '@pages/study/WritingActivity1'

import CardWord from './CardWord'

type WrapperSentenceBoxProps = {
  sentenceState: SentenceState
  sentenceData: { text: string; index: number }[]
  removeWord: (word: string, wordIndex: number) => void
}

const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

export default function WrapperSentenceBox({
  sentenceState,
  sentenceData,
  removeWord,
}: WrapperSentenceBoxProps) {
  return (
    <div
      className={`${style.enterBox} ${
        sentenceState === 'correct'
          ? style.correctText
          : sentenceState === 'incorrect'
          ? style.incorrectText
          : ''
      }`}
    >
      {sentenceData.map((sentence, i) => {
        return <CardWord text={sentence} removeWord={removeWord} />
      })}
    </div>
  )
}
