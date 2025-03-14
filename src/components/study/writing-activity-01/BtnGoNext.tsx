import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type BtnGoNextProps = {
  goNextQuiz: () => void
}

const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

export default function BtnGoNext({ goNextQuiz }: BtnGoNextProps) {
  return (
    <div
      onClick={() => goNextQuiz()}
      className={`${style.goNextButton} animate__animated animate__flash`}
    >
      Next
    </div>
  )
}
