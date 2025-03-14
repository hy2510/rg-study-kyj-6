import testResultCSS from '@stylesheets/test-result.module.scss'
import testResultCSSMobile from '@stylesheets/mobile/test-result.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type CardWrongAnswerProps = {
  index: number
  question: string
  correctAnswer: string
  selectedAnswer: string
}

const style = isMobile ? testResultCSSMobile : testResultCSS

export default function CardWrongAnswer({
  index,
  question,
  correctAnswer,
  selectedAnswer,
}: CardWrongAnswerProps) {
  return (
    <div className={style.quizQuestion}>
      <div className={style.questionSentence}>
        <span className={style.questionNum}>{Number(index + 1)}. </span>
        <span className={style.questionText}>{question}</span>
      </div>
      <div className={style.answers}>
        <div className={style.quizAnswer}>
          <div className={style.answers}>
            <span className={style.correctIcon}></span>

            <span className={style.correctAnswer}>{correctAnswer}</span>
          </div>

          {selectedAnswer !== '' && !Number(selectedAnswer) && (
            <div className={style.answers}>
              <span className={style.incorrectIcon}></span>

              <div className={style.wrongAnswer}>
                {selectedAnswer === '' ? '' : selectedAnswer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
