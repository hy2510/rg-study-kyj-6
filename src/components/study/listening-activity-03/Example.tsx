import { useContext } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'

import listeningCSS from '@stylesheets/listening-activity.module.scss'
import listeningCSSMobile from '@stylesheets/mobile/listening-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { IListeningActivity3Example } from '@interfaces/IListeningActivity'

type ExampleProps = {
  correctText: string
  example: IListeningActivity3Example
  index: number
  checkAnswer: (
    target: EventTarget & HTMLDivElement,
    selectedText: string,
  ) => Promise<void>
  onWrapperAnimationEndHandler: (
    e: React.AnimationEvent<HTMLDivElement>,
  ) => void
}

const style = isMobile ? listeningCSSMobile : listeningCSS

export default function Example({
  correctText,
  example,
  index,
  checkAnswer,
  onWrapperAnimationEndHandler,
}: ExampleProps) {
  const { bookInfo, studyInfo } = useContext(AppContext) as AppContextProps

  return (
    <div
      className={`${style.imageCard} 
      ${
        studyInfo.mode === 'review' &&
        Number(bookInfo.Average) >= 70 &&
        example.Text === correctText
          ? style.correct
          : ''
      }`}
      onClick={(e) => checkAnswer(e.currentTarget, example.Text)}
      onAnimationEnd={(e) => {
        onWrapperAnimationEndHandler(e)
      }}
    >
      <img
        src={example.Image}
        width={isMobile ? 'auto' : '100%'}
        height={isMobile ? '100%' : 'auto'}
      />
      <div className={style.cardNumberPosition}>
        <div className={style.cardNumber}>{Number(index + 1)}</div>
      </div>
    </div>
  )
}
