import vocabularyCSS from '@stylesheets/vocabulary-practice.module.scss'
import vocabularyCSSMobile from '@stylesheets/mobile/vocabulary-practice.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type BtnNextProps = {
  goTest: () => void
}

const style = isMobile ? vocabularyCSSMobile : vocabularyCSS

export default function BtnNext({ goTest }: BtnNextProps) {
  return (
    <div
      className={`${style.btnNext} animate__animated animate__flash`}
      onClick={() => goTest()}
    >
      Next
    </div>
  )
}
