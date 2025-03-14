import summaryCSS from '@stylesheets/summary.module.scss'
import summaryCSSMobile from '@stylesheets/mobile/summary.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { ISummary1Quiz } from '@interfaces/ISummary'
import Example from './Example'

type WrapperSentenceBottomProps = {
  isWorking: boolean
  exampleData: ISummary1Quiz[]
  checkAnswer: (
    target: EventTarget & HTMLDivElement,
    selectedAnswer: string,
  ) => Promise<void>
  onAnimationEnd: (target: EventTarget & HTMLDivElement) => void
}

const style = isMobile ? summaryCSSMobile : summaryCSS

export default function WrapperSentenceBottom({
  isWorking,
  exampleData,
  checkAnswer,
  onAnimationEnd,
}: WrapperSentenceBottomProps) {
  return (
    <div className={style.answers}>
      {exampleData.map((example, i) => {
        return (
          <Example
            key={`e-0${i}`}
            index={i}
            isWorking={isWorking}
            exampleData={example}
            checkAnswer={checkAnswer}
            onAnimationEnd={onAnimationEnd}
          />
        )
      })}
    </div>
  )
}
