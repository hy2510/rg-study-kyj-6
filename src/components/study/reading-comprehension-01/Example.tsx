import { useContext } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'

import readingComprehensionCSS from '@stylesheets/reading-comprehension.module.scss'
import readingComprehensionCSSMobile from '@stylesheets/mobile/reading-comprehension.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type ExampleProps = {
  index: number
  img: string
  text: string
  correctText: string
  checkAnswer: (
    target: EventTarget & HTMLDivElement,
    selectedAnswer: string,
  ) => Promise<void>
  onAnimationEndHandler: (e: React.AnimationEvent<HTMLDivElement>) => void
}

const style = isMobile ? readingComprehensionCSSMobile : readingComprehensionCSS

export default function Example({
  index,
  img,
  text,
  correctText,
  checkAnswer,
  onAnimationEndHandler,
}: ExampleProps) {
  const { bookInfo, studyInfo } = useContext(AppContext) as AppContextProps

  return (
    <div
      className={`${style.imageCard} ${
        studyInfo.mode === 'review' &&
        Number(bookInfo.Average) >= 70 &&
        correctText === text
          ? style.correct
          : ''
      } animate__animated`}
      onClick={(e) => checkAnswer(e.currentTarget, text)}
      onAnimationEnd={(e) => onAnimationEndHandler(e)}
    >
      <img
        src={img}
        width={isMobile ? 'auto' : '100%'}
        height={isMobile ? '100%' : 'auto'}
      />

      <div className={style.cardNumberPosition}>
        <div className={style.cardNumber}>{index}</div>
      </div>
    </div>
  )
}
