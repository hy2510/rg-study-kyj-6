import vocabularyCSS from '@stylesheets/vocabulary-test.module.scss'
import vocabularyCSSMobile from '@stylesheets/mobile/vocabulary-test.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { IVocabulary1Example } from '@interfaces/IVocabulary'

import Example from '@components/study/vocabulary-test-01/Example'

type WrapperExampleProps = {
  exampleData: IVocabulary1Example[]
  correctText: string
  checkAnswer: (
    target?: (EventTarget & HTMLDivElement) | undefined,
    selectedAnswer?: string,
  ) => Promise<void>
  onAnimationEndHandler: (e: React.AnimationEvent<HTMLDivElement>) => void
}

const style = isMobile ? vocabularyCSSMobile : vocabularyCSS

export default function WrapperExample({
  exampleData,
  correctText,
  checkAnswer,
  onAnimationEndHandler,
}: WrapperExampleProps) {
  return (
    <div className={style.answers}>
      {exampleData.map((example, i) => {
        return (
          <Example
            index={i + 1}
            text={example.Text}
            correctText={correctText}
            checkAnswer={checkAnswer}
            onAnimationEndHandler={onAnimationEndHandler}
          />
        )
      })}
    </div>
  )
}
