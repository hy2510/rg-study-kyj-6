import reactStringReplace from 'react-string-replace'

import clozeTestCSS from '@stylesheets/cloze-test.module.scss'
import clozeTestCSSMobile from '@stylesheets/mobile/cloze-test.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { IClozeTest2Quiz } from '@interfaces/IClozeTest'

import Input from './Input'
import InputPenalty from './InputPenalty'

type InputValue = {
  text: string
  isCorrected: boolean
}

type WrapperQuestionProps = {
  inputRefs: React.MutableRefObject<HTMLInputElement[]>
  isWorking: boolean
  exampleData: IClozeTest2Quiz
  currentIndex: number
  inputValues: InputValue[]
  penaltyState: 'none' | 'penalty' | 'success'

  changeInputValue: (index: number, newValue: string) => void
  changeInputIndex: (index: number) => void
  checkAnswer: () => void
  changePenaltyState: (state: 'none' | 'penalty' | 'success') => void
}

const style = isMobile ? clozeTestCSSMobile : clozeTestCSS

export default function WrapperQuestion({
  inputRefs,
  isWorking,
  exampleData,
  currentIndex,
  inputValues,
  penaltyState,
  changeInputValue,
  changeInputIndex,
  checkAnswer,
  changePenaltyState,
}: WrapperQuestionProps) {
  inputRefs.current = []
  let changeIndex = -1

  const example = exampleData.Question.Text.split(' ').map((el) => {
    return {
      text: el,
      index: el.includes('┒') ? ++changeIndex : 0,
    }
  })

  return (
    <div className={style.questionBox}>
      {example.map((word, i) => {
        if (word.text.includes('┒')) {
          return (
            <>
              {penaltyState === 'none'
                ? reactStringReplace(word.text, '┒', () => (
                    <Input
                      key={`text-input-${word.index}`}
                      inputRefs={inputRefs}
                      isWorking={isWorking}
                      inputIndex={word.index}
                      currentIndex={currentIndex}
                      inputValues={inputValues}
                      correctText={exampleData.Examples[word.index].Text}
                      changeInputValue={changeInputValue}
                      checkAnswer={checkAnswer}
                      changeInputIndex={changeInputIndex}
                    />
                  ))
                : reactStringReplace(word.text, '┒', () => (
                    <InputPenalty
                      key={`penalty-input-${word.index}`}
                      inputRefs={inputRefs}
                      penaltyState={penaltyState}
                      inputIndex={word.index}
                      currentIndex={currentIndex}
                      correctText={exampleData.Examples[word.index].Text}
                      changeInputIndex={changeInputIndex}
                      changePenaltyState={changePenaltyState}
                    />
                  ))}
            </>
          )
        } else {
          return (
            <span
              key={`word-${i}`}
              dangerouslySetInnerHTML={{ __html: word.text }}
            ></span>
          )
        }
      })}
    </div>
  )
}
