import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import icoMagic from '@assets/images/icons/ico_magic.svg'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

type BtnGECProps = {
  getGEC: () => void
}

export default function BtnGEC({ getGEC }: BtnGECProps) {
  return (
    <div className={style.gecButton} onClick={() => getGEC()}>
      <img src={icoMagic} alt="" />
      <span>AI Feedback</span>
    </div>
  )
}
