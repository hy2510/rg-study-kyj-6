import summaryCSS from '@stylesheets/summary.module.scss'
import summaryCSSMobile from '@stylesheets/mobile/summary.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { ISummary1Quiz } from '@interfaces/ISummary'

type ExampleProps = {
  index: number
  isWorking: boolean
  exampleData: ISummary1Quiz
  checkAnswer: (
    target: EventTarget & HTMLDivElement,
    selectedAnswer: string,
  ) => Promise<void>
  onAnimationEnd: (target: EventTarget & HTMLDivElement) => void
}

const style = isMobile ? summaryCSSMobile : summaryCSS

export default function Example({
  index,
  isWorking,
  exampleData,
  checkAnswer,
  onAnimationEnd,
}: ExampleProps) {
  return (
    <div
      className={`${style.textCard}`}
      onClick={(e) => {
        if (!isWorking) {
          checkAnswer(e.currentTarget, exampleData.Question.Text)
        }
      }}
      onAnimationEnd={(e) => onAnimationEnd(e.currentTarget)}
    >
      <div className={style.cardNumber}>{Number(index + 1)}</div>
      <div
        className={style.awnserText}
        dangerouslySetInnerHTML={{ __html: exampleData.Question.Text }}
      ></div>
    </div>
  )
}
