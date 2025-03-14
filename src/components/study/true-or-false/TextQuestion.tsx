import trueOrFalseCSS from '@stylesheets/true-or-false.module.scss'
import trueOrFalseCSSMobile from '@stylesheets/mobile/true-or-false.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type TextQuestionProps = {
  text: string
}

const style = isMobile ? trueOrFalseCSSMobile : trueOrFalseCSS

export default function TextQuestion({ text }: TextQuestionProps) {
  return (
    <div
      className={style.questionText}
      dangerouslySetInnerHTML={{ __html: text }}
    ></div>
  )
}
