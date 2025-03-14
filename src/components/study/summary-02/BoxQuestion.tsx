import { useEffect, useRef } from 'react'

import summaryCSS from '@stylesheets/summary.module.scss'
import summaryCSSMobile from '@stylesheets/mobile/summary.module.scss'

import { WordDataProp } from '@pages/study/Summary2'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import Answer from './Answer'

type BoxQuestionProps = {
  isComplete: boolean
  sentenceData: WordDataProp[]
  questionNo: number
}

const style = isMobile ? summaryCSSMobile : summaryCSS

export default function BoxQuestion({
  isComplete,
  sentenceData,
  questionNo,
}: BoxQuestionProps) {
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isComplete && boxRef.current) {
      boxRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }, [isComplete])

  return (
    <div ref={boxRef} className={style.questionBox}>
      {sentenceData.map((wordData, index) => {
        if (wordData.QuestionIndex > 0) {
          return (
            <Answer
              key={`answer-${index}`}
              isComplete={isComplete}
              wordData={wordData}
              questionNo={questionNo}
            />
          )
        } else {
          return (
            <span
              key={`answer-${index}`}
              className={style.word}
              dangerouslySetInnerHTML={{ __html: wordData.Word }}
            ></span>
          )
        }
      })}
    </div>
  )
}
