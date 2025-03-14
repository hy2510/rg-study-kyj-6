import summaryCSS from '@stylesheets/summary.module.scss'
import summaryCSSMobile from '@stylesheets/mobile/summary.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type BtnNextProps = {
  goNext: () => void
}

const style = isMobile ? summaryCSSMobile : summaryCSS

export default function BtnNext({ goNext }: BtnNextProps) {
  return (
    <div
      onClick={() => goNext()}
      className={`${style.btnNext} animate__animated animate__flash`}
    >
      Next
    </div>
  )
}
