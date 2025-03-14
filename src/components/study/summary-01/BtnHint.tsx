import summaryCSS from '@stylesheets/summary.module.scss'
import summaryCSSMobile from '@stylesheets/mobile/summary.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type BtnHintProps = {
  tryCnt: number | undefined
  maxCnt: number | undefined
  onClickHint: () => Promise<void>
}

const style = isMobile ? summaryCSSMobile : summaryCSS

export default function BtnHint({
  tryCnt = 0,
  maxCnt = 0,
  onClickHint,
}: BtnHintProps) {
  return (
    <div className={style.hintButton} onClick={() => onClickHint()}>
      Chance {maxCnt - tryCnt} / {maxCnt}
    </div>
  )
}
