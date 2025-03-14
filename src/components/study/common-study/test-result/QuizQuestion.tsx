import testResultCSS from '@stylesheets/test-result.module.scss'
import testResultCSSMobile from '@stylesheets/mobile/test-result.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type QuizQuestionProps = {
  questionNum: number
  questionText: string
  correctAnswerNum: number
  children: JSX.Element[]
}

const style = isMobile ? testResultCSSMobile : testResultCSS

export default function QuizQuestion({
  questionNum,
  questionText,
  correctAnswerNum,
  children,
}: QuizQuestionProps) {
  return (
    <div className={style.quizQuestion}>
      <div className={style.questionSentence}>
        <span className={style.questionNum}>{questionNum}. </span>
        <span className={style.questionText}>{questionText}</span>
      </div>
      <div className={style.answers}>{children}</div>
      <div className={style.correctAnswer}>
        <div className={style.txtL}>Correct Answer</div>
        <div className={style.correctAnswerNum}>{correctAnswerNum}</div>
      </div>
    </div>
  )
}
