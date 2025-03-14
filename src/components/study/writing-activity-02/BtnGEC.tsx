import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

type BtnGECProps = {
  getGEC: () => void
}

export default function BtnGEC({ getGEC }: BtnGECProps) {
  return (
    <div className={style.submitButton} onClick={() => getGEC()}>
      AI
    </div>
  )
}
