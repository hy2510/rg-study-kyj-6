import { useRef, useState } from 'react'

import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'

import { IResultGEC } from '@interfaces/IGEC'

const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()
const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

import ReportAreaLeft from './ai-report/ReportAreaLeft'
import ReportAreaRight from './ai-report/ReportAreaRight'

type AIReportProps = {
  GECData: IResultGEC
}

export default function AIReport({ GECData }: AIReportProps) {
  const [openStates, setOpenStates] = useState<{ isOpen: boolean }[]>(
    new Array(GECData.matches.length).fill(
      { isOpen: false },
      0,
      GECData.matches.length,
    ),
  )

  const cardRef = useRef<HTMLDivElement[]>([])

  const changeOpenStates = (index: number, value: boolean) => {
    let states = [...openStates]

    states = states.map((state, i) => (i === index ? { isOpen: value } : state))

    setOpenStates([...states])
  }

  return (
    <div className={style.aiFeedbackReport}>
      <ReportAreaLeft
        cardRef={cardRef}
        text={GECData.text}
        schedules={GECData.matches}
        changeOpenStates={changeOpenStates}
      />

      <ReportAreaRight
        cardRef={cardRef}
        matches={GECData.matches}
        openStates={openStates}
        changeOpenStates={changeOpenStates}
      />
    </div>
  )
}
