import { useState, useContext } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'

import listeningCSS from '@stylesheets/listening-activity.module.scss'
import listeningCSSMobile from '@stylesheets/mobile/listening-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type CardWordProps = {
  text: string
  correctText: string
  isCorrected?: boolean
  checkAnswer: (
    target: EventTarget & HTMLDivElement,
    selectedAnswer: string,
  ) => Promise<void>
  onCardAnimationEndHandler: (
    e: React.AnimationEvent<HTMLDivElement>,
    disabledCard: () => void,
  ) => void
}

const style = isMobile ? listeningCSSMobile : listeningCSS

export default function CardWord({
  text,
  correctText,
  isCorrected = false,
  checkAnswer,
  onCardAnimationEndHandler,
}: CardWordProps) {
  const { studyInfo, bookInfo } = useContext(AppContext) as AppContextProps
  const [isShowWord, setShowWord] = useState<boolean>(false)
  const [reviewState, setReviewState] = useState(studyInfo.mode === 'review')

  const selectExample = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if ((!isCorrected && !isShowWord) || reviewState) {
      checkAnswer(e.currentTarget, text)
    }
  }

  const disabledCard = () => {
    if (reviewState && correctText === text) {
      setReviewState(false)
    }
    setShowWord(true)
  }

  return (
    <div
      className={`animate__animated ${style.wordCard} ${
        (isShowWord || isCorrected) && !reviewState ? style.done : ''
      } 
    ${
      reviewState && Number(bookInfo.Average) >= 70 && correctText === text
        ? style.correct
        : ''
    }`}
      onClick={(e) => {
        selectExample(e)
      }}
      onAnimationEnd={(e) => onCardAnimationEndHandler(e, disabledCard)}
    >
      <div className={style.txtL}>{text}</div>
    </div>
  )
}
