import reactStringReplace from 'react-string-replace'

import clozeTestCSS from '@stylesheets/cloze-test.module.scss'
import clozeTestCSSMobile from '@stylesheets/mobile/cloze-test.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type BoxQuestionProps = {
  blankRef: React.RefObject<HTMLSpanElement>
  question: string
  correctAnswer: string
}

import BoxBlank from './BoxBlank'

const style = isMobile ? clozeTestCSSMobile : clozeTestCSS

export default function BoxQuestion({
  blankRef,
  question,
  correctAnswer,
}: BoxQuestionProps) {
  return (
    <div className={style.questionBox}>
      {question.split(' ').map((word, i) => {
        if (word.includes('┒')) {
          return reactStringReplace(word, '┒', () => (
            <BoxBlank blankRef={blankRef} correctAnswer={correctAnswer} />
          ))
        } else {
          return <span dangerouslySetInnerHTML={{ __html: word }}></span>
        }
      })}
    </div>
  )
}
