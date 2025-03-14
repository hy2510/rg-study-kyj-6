import summaryCSS from '@stylesheets/summary.module.scss'
import summaryCSSMobile from '@stylesheets/mobile/summary.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

const style = isMobile ? summaryCSSMobile : summaryCSS

export default function ArrowUp() {
  return (
    <div className={style.correctDirection}>
      <div className={style.iconArrowUp}></div>
    </div>
  )
}
