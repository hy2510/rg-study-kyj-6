import { useEffect, useRef } from 'react'

import vocabularyCSS from '@stylesheets/vocabulary-practice.module.scss'
import vocabularyCSSMobile from '@stylesheets/mobile/vocabulary-practice.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { IVocabulary3Practice } from '@interfaces/IVocabulary'

type InputProps = {
  isSideOpen: boolean
  isEnabledTyping: boolean
  quizData: IVocabulary3Practice
  quizNo: number
  tryCount: number
  inputVal: string
  disabled: boolean
  changeInputVal: (value: string) => void
  checkAnswer: (skipType?: string) => Promise<void>
}

const style = isMobile ? vocabularyCSSMobile : vocabularyCSS

export default function Input({
  isSideOpen,
  isEnabledTyping,
  quizData,
  quizNo,
  tryCount,
  inputVal,
  disabled,
  changeInputVal,
  checkAnswer,
}: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onClickHandler = () => {
      if (inputRef.current) {
        if (isSideOpen) {
          inputRef.current.blur()
        } else {
          inputRef.current.focus()
        }
      }
    }

    onClickHandler()

    window.addEventListener('click', onClickHandler)

    return () => {
      window.removeEventListener('click', onClickHandler)
    }
  }, [isSideOpen])

  /**
   * 키보드 타이핑 이벤트
   * @param e
   */
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    const regex = /^[ㄱ-ㅎa-zA-Z-'’‘”~ ]+(?:'){0,1}[a-zA-Z]?$/g
    let text: string = e.currentTarget.value

    // 아이폰 구두점 대응 코드
    switch (text.slice(-1)) {
      case `‘`:
        text = text.replace(`‘`, `'`)
        break

      case `’`:
        text = text.replace(`’`, `'`)
        break

      case `”`:
        text = text.replace(`”`, `"`)
        break
    }

    if (!regex.test(text)) {
      text = text.slice(0, text.length - 1)
    }

    changeInputVal(text)
  }

  /**
   * 키보드 타이핑 이벤트
   * @param e
   */
  const onKeyUpHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const text = e.currentTarget.value

    if (text === quizData.Quiz[quizNo - 1].Question.Text) {
      checkAnswer()
    } else {
      if (e.key === 'Enter') {
        checkAnswer()
      }
    }
  }

  return (
    <div className={style.textField}>
      <input
        ref={inputRef}
        className={`${style.inputField} ${
          quizData.Quiz[quizNo - 1].Question.Text.length > 15
            ? style.overLength
            : ''
        }`}
        type="text"
        value={inputVal}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        inputMode="search"
        onChange={(e) => onChangeHandler(e)}
        onKeyUp={(e) => onKeyUpHandler(e)}
        onCopy={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
        disabled={!isEnabledTyping || disabled}
        autoFocus
        tabIndex={-1}
      />
      <div
        className={`${style.wordText} ${
          quizData.Quiz[quizNo - 1].Question.Text.length > 15
            ? style.overLength
            : ''
        }`}
      >
        {quizData.Quiz[quizNo - 1].Question.Text}
      </div>
      <div className={style.count}>
        {tryCount + 1} / {quizData.QuizAnswerCount}
      </div>
    </div>
  )
}
