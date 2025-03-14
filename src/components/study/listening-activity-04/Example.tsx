import { useContext, useRef } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'

import listeningCSS from '@stylesheets/listening-activity.module.scss'
import listeningCSSMobile from '@stylesheets/mobile/listening-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { MultiPlayStateProps } from '@pages/study/ListeningActivity4'
import { IListeningActivity4Example } from '@interfaces/IListeningActivity'

type ExampleProps = {
  index: number
  multiPlayState: MultiPlayStateProps
  correctText: string
  exampleData: IListeningActivity4Example
  playWord: (index: number) => void
  checkAnswer: (
    target: React.RefObject<HTMLDivElement>,
    selectedText: string,
  ) => Promise<void>
  onAnimationEndHandler: (e: React.AnimationEvent<HTMLDivElement>) => void
}

import { IcoReturn } from '@components/common/Icons'
import BtnPlayWord from './BtnPlayWord'

const style = isMobile ? listeningCSSMobile : listeningCSS

export default function Example({
  index,
  multiPlayState,
  correctText,
  exampleData,
  playWord,
  checkAnswer,
  onAnimationEndHandler,
}: ExampleProps) {
  const { bookInfo, studyInfo } = useContext(AppContext) as AppContextProps

  const cardRef = useRef<HTMLDivElement>(null)

  const clickAnswer = () => {
    checkAnswer(cardRef, exampleData.Text)
  }

  return (
    <div
      ref={cardRef}
      className={`${style.soundCard} 
      ${
        studyInfo.mode === 'review' &&
        Number(bookInfo.Average) >= 70 &&
        exampleData.Text === correctText
          ? style.correct
          : ''
      }`}
      onAnimationEnd={(e) => onAnimationEndHandler(e)}
    >
      <div className={style.cardNumberPosition}>
        <div className={style.cardNumber}>{Number(index + 1)}</div>
      </div>
      <div className={style.playSoundPosition}>
        <BtnPlayWord
          multiPlayState={multiPlayState}
          index={index}
          playWord={playWord}
        />
      </div>
      <span className={style.enterButton} onClick={() => clickAnswer()}>
        <span>
          <IcoReturn width={15} height={15} />
        </span>
      </span>
    </div>
  )
}
