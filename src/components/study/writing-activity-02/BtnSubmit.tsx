import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type BtnSubmitProps = {
  isSubmit: boolean
  submitAnswer: () => void
}

const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

export default function BtnSubmit({ isSubmit, submitAnswer }: BtnSubmitProps) {
  return (
    <div
      style={!isSubmit ? { opacity: '0.5', cursor: 'default' } : {}}
      className={style.submitButton}
      onClick={() => submitAnswer()}
    >
      Submit
    </div>
  )
}
