import testResultCSS from '@stylesheets/test-result.module.scss'
import testResultCSSMobile from '@stylesheets/mobile/test-result.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { IRecordAnswerType } from '@interfaces/Common'
import { IReadingComprehension4 } from '@interfaces/IReadingComprehension'

type WrapperWrongAnswerProps = {
  quizData: IReadingComprehension4
  failedExample: IRecordAnswerType[]
}

import CardWrongAnswer from './CardWrongAnswer'

const style = isMobile ? testResultCSSMobile : testResultCSS

export default function WrapperWrongAnswer({
  quizData,
  failedExample,
}: WrapperWrongAnswerProps) {
  return (
    <div className={style.wrongAnswers}>
      {failedExample.length != 0 && (
        <div className={style.title}>Wrong Answers</div>
      )}
      {failedExample.map((example, i) => {
        return (
          <CardWrongAnswer
            index={i}
            question={quizData.Quiz[example.CurrentQuizNo - 1].Question.Text}
            correctAnswer={
              quizData.Quiz[example.CurrentQuizNo - 1].Examples[0].Text
            }
            selectedAnswer={example.StudentAnswer}
          />
        )
      })}
    </div>
  )
}
