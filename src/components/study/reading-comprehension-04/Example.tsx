import { useContext } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'

import readingComprehensionCSS from '@stylesheets/reading-comprehension.module.scss'
import readingComprehensionCSSMobile from '@stylesheets/mobile/reading-comprehension.module.scss'
readingComprehensionCSS

import { IReadingComprehension4Example } from '@interfaces/IReadingComprehension'

type ExampleProps = {
  correctText: string
  exampleData: IReadingComprehension4Example
  index: number
  checkAnswer: (
    selectedAnswer: string,
    target: EventTarget & HTMLDivElement,
  ) => Promise<void>
}

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

const style = isMobile ? readingComprehensionCSSMobile : readingComprehensionCSS

export default function Example({
  correctText,
  exampleData,
  index,
  checkAnswer,
}: ExampleProps) {
  const { bookInfo, studyInfo } = useContext(AppContext) as AppContextProps

  return (
    <div
      className={`${style.textCard} ${
        studyInfo.mode === 'review' &&
        Number(bookInfo.Average) >= 70 &&
        exampleData.Text === correctText
          ? style.correct
          : ''
      }`}
      onClick={(e) => checkAnswer(exampleData.Text, e.currentTarget)}
    >
      <div className={style.cardNumber}>{Number(index + 1)}</div>

      <div
        className={style.awnserText}
        dangerouslySetInnerHTML={{ __html: exampleData.Text }}
      ></div>
    </div>
  )
}
