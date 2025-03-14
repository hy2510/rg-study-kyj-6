import readingComprehensionCSS from '@stylesheets/reading-comprehension.module.scss'
import readingComprehensionCSSMobile from '@stylesheets/mobile/reading-comprehension.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { IReadingComprehension4Example } from '@interfaces/IReadingComprehension'

type WrapperAnswerProps = {
  isHideQuestion: boolean
  question: string
  correctText: string
  exampleData: IReadingComprehension4Example[]
  checkAnswer: (
    selectedAnswer: string,
    target?: EventTarget & HTMLDivElement,
  ) => Promise<void>
}

import Gap from '../common-study/Gap'
import TextQuestion from './TextQuestion'
import WrapperExample from './WrapperExample'

const style = isMobile ? readingComprehensionCSSMobile : readingComprehensionCSS

export default function WrapperAnswer({
  isHideQuestion,
  question,
  correctText,
  exampleData,
  checkAnswer,
}: WrapperAnswerProps) {
  return (
    <div className={style.answers}>
      {isMobile ? <Gap height={5} /> : <Gap height={10} />}

      {!isHideQuestion && <TextQuestion question={question} />}

      {isMobile ? <Gap height={0} /> : <Gap height={10} />}

      <WrapperExample
        correctText={correctText}
        exampleData={exampleData}
        checkAnswer={checkAnswer}
      />
    </div>
  )
}
