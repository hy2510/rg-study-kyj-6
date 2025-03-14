import vocabularyCSS from '@stylesheets/vocabulary-practice.module.scss'
import vocabularyCSSMobile from '@stylesheets/mobile/vocabulary-practice.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { IcoArrowRight } from '@components/common/Icons'

const style = isMobile ? vocabularyCSSMobile : vocabularyCSS

type BtnSkipProps = {
  checkAnswer: (skipType?: string) => Promise<void>
}

export default function BtnSkip({ checkAnswer }: BtnSkipProps) {
  return (
    <div
      className={style.skipButton}
      onClick={() => checkAnswer('user press skip')}
    >
      <span>SKIP</span>
      <IcoArrowRight width={14} height={14} />
    </div>
  )
}
