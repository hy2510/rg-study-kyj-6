import { useContext } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'

import vocabularyCSS from '@stylesheets/vocabulary-test.module.scss'
import vocabularyCSSMobile from '@stylesheets/mobile/vocabulary-test.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { IVocabulary2Example } from '@interfaces/IVocabulary'

type ExampleProps = {
  index: number
  correctText: string
  exampleData: IVocabulary2Example
  checkAnswer: (
    target: EventTarget & HTMLDivElement,
    selectedText: string,
  ) => Promise<void>
  onAnimationEndHandler: (e: React.AnimationEvent<HTMLDivElement>) => void
}

const style = isMobile ? vocabularyCSSMobile : vocabularyCSS

export default function Example({
  index,
  correctText,
  exampleData,
  checkAnswer,
  onAnimationEndHandler,
}: ExampleProps) {
  const { bookInfo, studyInfo } = useContext(AppContext) as AppContextProps

  return (
    <div
      className={`${style.textCard}
      ${
        studyInfo.mode === 'review' &&
        Number(bookInfo.Average) >= 70 &&
        exampleData.Text === correctText
          ? style.correct
          : ''
      }`}
      onClick={(e) => checkAnswer(e.currentTarget, exampleData.Text)}
      onAnimationEnd={(e) => onAnimationEndHandler(e)}
    >
      <div className={style.cardNumber}>{Number(index + 1)}</div>
      <div className={style.awnserText}>{exampleData.Text}</div>
    </div>
  )
}
