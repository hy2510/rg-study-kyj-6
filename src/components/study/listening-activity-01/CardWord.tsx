import { useState, useContext } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'

import listeningCSS from '@stylesheets/listening-activity.module.scss'
import listeningCSSMobile from '@stylesheets/mobile/listening-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type CardWordProps = {
  imgSrc: string
  text: string
  correctText: string
  isCorrected?: boolean
  onCardAnimationEndHandler: (
    e: React.AnimationEvent<HTMLDivElement>,
    appearWord: () => void,
  ) => void
  onWordAnimationEndHandler: (
    e: React.AnimationEvent<HTMLDivElement>,
    isCorrected: boolean | undefined,
  ) => void
  checkAnswer: (
    target: EventTarget & HTMLDivElement,
    selectedAnswer: string,
  ) => Promise<void>
}

const style = isMobile ? listeningCSSMobile : listeningCSS

export default function CardWord({
  imgSrc,
  text,
  correctText,
  isCorrected = false,
  onCardAnimationEndHandler,
  onWordAnimationEndHandler,
  checkAnswer,
}: CardWordProps) {
  const { studyInfo, bookInfo } = useContext(AppContext) as AppContextProps
  const [isShowWord, setShowWord] = useState<boolean>(false)
  const [reviewState, setReviewState] = useState(studyInfo.mode === 'review')

  const selectExample = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if ((!isCorrected && !isShowWord) || reviewState) {
      checkAnswer(e.currentTarget, text)
    }
  }

  const appearWord = () => {
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
      onAnimationEnd={(e) => {
        onCardAnimationEndHandler(e, appearWord)
      }}
    >
      <img src={imgSrc} />
      {(isShowWord || isCorrected) && !reviewState && (
        <>
          <div className={`${style.word}`}>{text}</div>
          <div
            className={`${style.wordBlock} animate__animated animate__fadeIn`}
            onAnimationEnd={(e) => {
              onWordAnimationEndHandler(e, isCorrected)
            }}
          ></div>
        </>
      )}
    </div>
  )
}
