import React from 'react'
import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'
import { LottieFlyPaperAirplane } from '@components/common/LottieAnims'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

export default function LoadingBox() {
  return (
    <div className={style.loadingBox}>
      <div className={style.messageBox}>
        <LottieFlyPaperAirplane width={150} height={150} />
        <div>AI가 첨삭중</div>
      </div>
    </div>
  )
}
