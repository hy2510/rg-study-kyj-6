import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import BtnEdit from './BtnEdit'
import BtnSubmit from './BtnSubmit'

type GoNextStepBoxProps = {
  wordMinCount: number
  wordMaxCount: number
  answerLength: number
  submitAnswer: () => void
  resetGEC: () => void
}

const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

export default function GoNextStepAiBox({
  wordMinCount,
  wordMaxCount,
  answerLength,
  submitAnswer,
  resetGEC,
}: GoNextStepBoxProps) {
  return (
    <div className={style.goNextStepBox}>
      <div className={style.wordLimitIndicator}>
        <div className={style.limit}>
          • Word Limit: {wordMinCount}~{wordMaxCount}
        </div>
        <div className={style.words}>• The number of words: {answerLength}</div>
      </div>

      <BtnEdit resetGEC={resetGEC} />
      <BtnSubmit isSubmit={true} submitAnswer={submitAnswer} />
    </div>
  )
}
