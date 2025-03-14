import listeningCSS from '@stylesheets/listening-activity.module.scss'
import listeningCSSMobile from '@stylesheets/mobile/listening-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { MultiPlayStateProps } from '@pages/study/ListeningActivity4'
import { IListeningActivity4Example } from '@interfaces/IListeningActivity'

type WrapperExampleProps = {
  multiPlayState: MultiPlayStateProps
  correctText: string
  exampleData: IListeningActivity4Example[]
  playWord: (index: number) => void
  checkAnswer: (
    target: React.RefObject<HTMLDivElement>,
    selectedText: string,
  ) => Promise<void>
  onAnimationEndHandler: (e: React.AnimationEvent<HTMLDivElement>) => void
}

import Example from './Example'

const style = isMobile ? listeningCSSMobile : listeningCSS

export default function WrapperExample({
  multiPlayState,
  correctText,
  exampleData,
  playWord,
  checkAnswer,
  onAnimationEndHandler,
}: WrapperExampleProps) {
  return (
    <div className={style.answers}>
      {exampleData.map((example, i) => {
        return (
          <Example
            key={`e-0${i}`}
            index={i}
            multiPlayState={multiPlayState}
            correctText={correctText}
            exampleData={example}
            playWord={playWord}
            checkAnswer={checkAnswer}
            onAnimationEndHandler={onAnimationEndHandler}
          />
        )
      })}
    </div>
  )
}
