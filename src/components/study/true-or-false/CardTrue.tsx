import { useContext, useEffect, useState } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'

import trueOrFalseCSS from '@stylesheets/true-or-false.module.scss'
import trueOrFalseCSSMobile from '@stylesheets/mobile/true-or-false.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type CardTrueProps = {
  quizNo: number
  isCorrect: boolean
  checkAnswer: (target: HTMLDivElement, selectedBtn: boolean) => Promise<void>
}

const style = isMobile ? trueOrFalseCSSMobile : trueOrFalseCSS

export default function CardTrue({
  quizNo,
  isCorrect,
  checkAnswer,
}: CardTrueProps) {
  const { bookInfo, studyInfo } = useContext(AppContext) as AppContextProps

  const [review, setReview] = useState({
    quizNo: quizNo,
    view: '',
  })

  useEffect(() => {
    if (studyInfo.mode === 'staff') {
      setReview({
        quizNo: quizNo,
        view: isCorrect ? trueOrFalseCSS.correct : '',
      })
    } else {
      setReview({
        quizNo: quizNo,
        view:
          studyInfo.mode === 'review' &&
          Number(bookInfo.Average) >= 70 &&
          isCorrect
            ? trueOrFalseCSS.correct
            : '',
      })
    }
  }, [quizNo])

  return (
    <div
      className={`${style.textCard}  ${
        quizNo === review.quizNo && review.view
      }`}
      onClick={(e) => checkAnswer(e.currentTarget, true)}
    >
      <div className={style.answer}>
        <div className={style.true}>O</div>
        <div className={style.answerText}>True</div>
      </div>
    </div>
  )
}
