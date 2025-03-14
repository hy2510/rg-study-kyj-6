import { useContext, useEffect, useRef } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'

import summaryCSS from '@stylesheets/summary.module.scss'
import summaryCSSMobile from '@stylesheets/mobile/summary.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { ISummary1Quiz } from '@interfaces/ISummary'
import { IScoreBoardData } from '@interfaces/Common'
import { MultiPlayStateProps } from '@pages/study/Summary1'

import SentenceHelp from './SentenceHelp'
import SelectedSentence from './SelectedSentence'

type WrapperSentenceTopProps = {
  isStepEnd: boolean
  multiPlayState: MultiPlayStateProps
  sentenceData: ISummary1Quiz[]
  selectedData: IScoreBoardData[]
  playSentence: (index: number) => void
}

const style = isMobile ? summaryCSSMobile : summaryCSS

export default function WrapperSentenceTop({
  isStepEnd,
  multiPlayState,
  sentenceData,
  selectedData,
  playSentence,
}: WrapperSentenceTopProps) {
  const { studyInfo } = useContext(AppContext) as AppContextProps

  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (wrapperRef.current && studyInfo.mode === 'student') {
      wrapperRef.current.scrollTo({
        top: wrapperRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [selectedData])

  return (
    <div
      ref={wrapperRef}
      className={`${style.correctOrders} ${isStepEnd && style.stepEnd}`}
    >
      {sentenceData.map((sentence, i) => {
        return selectedData[i] ? (
          <SelectedSentence
            key={`$ss-0${i}`}
            multiPlayState={multiPlayState}
            index={i}
            sentenceData={sentence}
            selectedData={selectedData[i]}
            playSentence={playSentence}
          />
        ) : (
          <></>
        )
      })}

      {!selectedData[0] && <SentenceHelp />}
    </div>
  )
}
