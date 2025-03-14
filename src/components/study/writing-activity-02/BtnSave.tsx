import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type BtnSaveProps = {
  saveAnswer: () => Promise<void>
}

const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

export default function BtnSave({ saveAnswer }: BtnSaveProps) {
  return (
    <div className={style.saveButton} onClick={() => saveAnswer()}>
      Save
    </div>
  )
}
