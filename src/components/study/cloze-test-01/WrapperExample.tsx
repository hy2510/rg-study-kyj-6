import clozeTestCSS from '@stylesheets/cloze-test.module.scss'
import clozeTestCSSMobile from '@stylesheets/mobile/cloze-test.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { IClozeTest1Example } from '@interfaces/IClozeTest'

type WrapperExampleProps = {
  correctText: string
  exampleData: IClozeTest1Example[]
  checkAnswer: (
    target: EventTarget & HTMLDivElement,
    selectedWord?: string,
  ) => Promise<void>
}

import Example from './Example'

const style = isMobile ? clozeTestCSSMobile : clozeTestCSS

export default function WrapperExample({
  correctText,
  exampleData,
  checkAnswer,
}: WrapperExampleProps) {
  return (
    <div className={style.answers}>
      <div className={style.container}>
        {exampleData.map((example, i) => {
          return (
            <Example
              index={i}
              correctText={correctText}
              example={example}
              checkAnswer={checkAnswer}
            />
          )
        })}
      </div>
    </div>
  )
}
