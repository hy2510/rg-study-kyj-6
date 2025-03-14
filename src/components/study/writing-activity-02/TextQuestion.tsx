import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type TextQuestionProps = {
  question: string
}

const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

export default function TextQuestion({ question }: TextQuestionProps) {
  return <div className={style.questionText}>{question}</div>
}
