import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'
import { IMatch } from '@interfaces/IGEC'

const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()
const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

type HeaderCorrectionProps = {
  matches: IMatch[]
}

export default function HeaderCorrection({ matches }: HeaderCorrectionProps) {
  let grammarCnt: number = 0,
    mechanicsCnt: number = 0,
    otherCnt: number = 0,
    punctuationCnt: number = 0

  matches.map((match) => {
    switch (match.tag[0].category) {
      case 'Grammar':
        grammarCnt += 1
        break
      case 'Mechanics':
        mechanicsCnt += 1
        break
      case 'Other':
        otherCnt += 1
        break
      case 'Punctuations':
        punctuationCnt += 1
        break
    }
  })

  return (
    <div className={style.correctionHeader}>
      <div className={style.txtHeader}>
        Total Corrections - {matches.length}
      </div>
      <div className={style.correctionItems}>
        <div className={`${style.correctionItem} ${style.green}`}>
          Grammar <span>{grammarCnt}</span>
        </div>

        <div className={`${style.correctionItem} ${style.red}`}>
          Mechanics
          <span>{mechanicsCnt}</span>
        </div>

        <div className={`${style.correctionItem} ${style.yellow}`}>
          Other
          <span>{otherCnt}</span>
        </div>

        <div className={`${style.correctionItem} ${style.blue}`}>
          Punctuation
          <span>{punctuationCnt}</span>
        </div>
      </div>
    </div>
  )
}
