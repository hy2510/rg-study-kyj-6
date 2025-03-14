import summaryCSS from '@stylesheets/summary.module.scss'
import summaryCSSMobile from '@stylesheets/mobile/summary.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { ISummary2Example } from '@interfaces/ISummary'

type ExampleProps = {
  index: number
  exampleData: ISummary2Example
  checkAnswer: (
    target: EventTarget & HTMLDivElement,
    selectedText: string,
  ) => Promise<void>
  onAnimationEnd: (target: EventTarget & HTMLDivElement) => void
}

const style = isMobile ? summaryCSSMobile : summaryCSS

export default function Example({
  index,
  exampleData,
  checkAnswer,
  onAnimationEnd,
}: ExampleProps) {
  return (
    <div
      className={`${style.textCard}`}
      onClick={(e) => checkAnswer(e.currentTarget, exampleData.Text)}
      onAnimationEnd={(e) => onAnimationEnd(e.currentTarget)}
    >
      <div className={style.cardNumber}>{Number(index + 1)}</div>
      <div className={style.awnserText}>{exampleData.Text}</div>
    </div>
  )
}
