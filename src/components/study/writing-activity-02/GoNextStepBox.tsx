import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import BtnSave from './BtnSave'
import BtnSubmit from './BtnSubmit'
import BtnGEC from './BtnGEC'

type GoNextStepBoxProps = {
  isSubmit: boolean
  wordMinCount: number
  wordMaxCount: number
  answerLength: number
  saveAnswer: () => Promise<void>
  submitAnswer: () => void
  getGEC: () => void
}

const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

export default function GoNextStepBox({
  isSubmit,
  wordMinCount,
  wordMaxCount,
  answerLength,
  saveAnswer,
  submitAnswer,
  getGEC,
}: GoNextStepBoxProps) {
  return (
    <div className={style.goNextStepBox}>
      <div className={style.wordLimitIndicator}>
        <div className={style.limit}>
          • Word Limit: {wordMinCount}~{wordMaxCount}
        </div>
        <div className={style.words}>• The number of words: {answerLength}</div>
      </div>

      <BtnSave saveAnswer={saveAnswer} />

      {/* <BtnSubmit isSubmit={isSubmit} submitAnswer={submitAnswer} /> */}
      <BtnGEC getGEC={getGEC} />
    </div>
  )
}
