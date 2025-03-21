import { MutableRefObject } from 'react'

import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'

const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()
const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

import { IMatch } from '@interfaces/IGEC'

import HeaderCorrection from './HeaderCorrection'
import CorrectionCard from './CorrectionCard'

type ReportAreaRightProps = {
  cardRef: MutableRefObject<HTMLDivElement[]>
  matches: IMatch[]
  openStates: {
    isOpen: boolean
  }[]
  changeOpenStates: (index: number, value: boolean) => void
}

export default function ReportAreaRight({
  cardRef,
  matches,
  openStates,
  changeOpenStates,
}: ReportAreaRightProps) {
  return (
    <div className={style.rightArea}>
      <HeaderCorrection matches={matches} />

      {matches.map((match, i) => {
        return (
          <CorrectionCard
            index={i}
            cardRef={cardRef}
            openStates={openStates}
            match={match}
            changeOpenStates={changeOpenStates}
          />
        )
      })}
    </div>
  )
}
