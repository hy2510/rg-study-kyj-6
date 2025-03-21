import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

type BtnSaveProps = {
  resetGEC: () => void
}

export default function BtnEdit({ resetGEC }: BtnSaveProps) {
  return (
    <div className={style.saveButton} onClick={() => resetGEC()}>
      Edit
    </div>
  )
}
