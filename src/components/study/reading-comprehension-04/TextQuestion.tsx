import readingComprehensionCSS from '@stylesheets/reading-comprehension.module.scss'
import readingComprehensionCSSMobile from '@stylesheets/mobile/reading-comprehension.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type TextQuestionProps = {
  question: string
}

const style = isMobile ? readingComprehensionCSSMobile : readingComprehensionCSS

export default function TextQuestion({ question }: TextQuestionProps) {
  return (
    <div
      className={style.questionText}
      dangerouslySetInnerHTML={{ __html: question }}
    ></div>
  )
}
