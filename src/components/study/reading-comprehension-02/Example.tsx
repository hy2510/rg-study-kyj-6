import { useContext, useRef } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'

import readingComprehensionCSS from '@stylesheets/reading-comprehension.module.scss'
import readingComprehensionCSSMobile from '@stylesheets/mobile/reading-comprehension.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { MultiPlayStateProps } from '@pages/study/ReadingComprehension2'

type ExamplePops = {
  multiPlayState: MultiPlayStateProps
  sentence: string
  correctSentence: string
  index: number
  playSentence: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number,
  ) => void
  checkAnswer: (
    target: React.RefObject<HTMLDivElement>,
    index: number,
  ) => Promise<void>
  onAnimationEndHandler: (e: React.AnimationEvent<HTMLDivElement>) => void
}

import { IcoReturn } from '@components/common/Icons'
import BtnPlaySentence from './BtnPlaySentence'

const style = isMobile ? readingComprehensionCSSMobile : readingComprehensionCSS

export default function Example({
  multiPlayState,
  sentence,
  correctSentence,
  index,
  playSentence,
  checkAnswer,
  onAnimationEndHandler,
}: ExamplePops) {
  const { bookInfo, studyInfo } = useContext(AppContext) as AppContextProps
  const cardRef = useRef<HTMLDivElement>(null)

  const clickAnswer = () => {
    checkAnswer(cardRef, index)
  }

  return (
    <div
      ref={cardRef}
      className={`${style.textCard} ${
        studyInfo.mode === 'review' &&
        Number(bookInfo.Average) >= 70 &&
        correctSentence === sentence
          ? style.correct
          : ''
      }`}
      onAnimationEnd={(e) => onAnimationEndHandler(e)}
    >
      <div className={style.cardNumber}>{Number(index + 1)}</div>

      <BtnPlaySentence
        multiPlayState={multiPlayState}
        sentence={sentence}
        index={index}
        playSentence={playSentence}
      />

      <span className={style.enterButton} onClick={() => clickAnswer()}>
        <span>
          <IcoReturn width={15} height={15} />
        </span>
      </span>
    </div>
  )
}
