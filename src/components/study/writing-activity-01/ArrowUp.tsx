import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

export default function ArrowUp() {
  return (
    <div className={style.correctDirection}>
      <div className={style.iconArrowUp}></div>
    </div>
  )
}
