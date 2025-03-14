import summaryCSS from '@stylesheets/summary.module.scss'
import summaryCSSMobile from '@stylesheets/mobile/summary.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type BtnGoNextProps = {
  showResult: () => void
}

const style = isMobile ? summaryCSSMobile : summaryCSS

export default function BtnGoNext({ showResult }: BtnGoNextProps) {
  return (
    <div className={`${style.btnNext}`} onClick={() => showResult()}>
      Next
    </div>
  )
}
