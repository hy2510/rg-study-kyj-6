import trueOrFalseCSS from '@stylesheets/true-or-false.module.scss'
import trueOrFalseCSSMobile from '@stylesheets/mobile/true-or-false.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type WrapperCardProps = {
  quizNo: number
  isCorrect: boolean
  checkAnswer: (target: HTMLDivElement, selectedBtn: boolean) => Promise<void>
}

import CardTrue from './CardTrue'
import CardFalse from './CardFalse'

const style = isMobile ? trueOrFalseCSSMobile : trueOrFalseCSS

export default function WrapperCard({
  quizNo,
  isCorrect,
  checkAnswer,
}: WrapperCardProps) {
  return (
    <div className={style.answers}>
      <CardTrue
        quizNo={quizNo}
        isCorrect={isCorrect}
        checkAnswer={checkAnswer}
      />

      <CardFalse
        quizNo={quizNo}
        isCorrect={isCorrect}
        checkAnswer={checkAnswer}
      />
    </div>
  )
}
