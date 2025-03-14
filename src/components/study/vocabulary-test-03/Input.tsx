import { useEffect, useRef } from 'react'

import vocabularyCSS from '@stylesheets/vocabulary-test.module.scss'
import vocabularyCSSMobile from '@stylesheets/mobile/vocabulary-test.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { BottomPopupStateProps } from '@hooks/study/useBottomPopup'

type InputProps = {
  isWorking: boolean
  bottomPopupState: BottomPopupStateProps
  isSideOpen: boolean
  isHint: boolean
  inputVal: string
  correctAnswer: string
  changeInputVal: (value: string) => void
  checkAnswer: (selectedAnswer: string) => Promise<void>
}

const style = isMobile ? vocabularyCSSMobile : vocabularyCSS

export default function Input({
  isWorking,
  bottomPopupState,
  isSideOpen,
  isHint,
  inputVal,
  correctAnswer,
  changeInputVal,
  checkAnswer,
}: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onClickHandler = () => {
      if (inputRef.current) {
        if (isSideOpen || isHint) {
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
  }, [isSideOpen, isHint])

  /**
   * 키보드 타이핑 이벤트
   * @param e
   */
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isWorking) {
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
  }

  /**
   * 키보드 타이핑 이벤트
   * @param e
   */
  const onKeyUpHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isWorking && inputVal !== '') {
      checkAnswer(inputVal)
    }
  }

  return (
    <div
      className={`${style.textField} animate__animated} ${
        bottomPopupState.isActive && !bottomPopupState.isCorrect
          ? `animate__headShake ${style.incorrect}`
          : ''
      }`}
    >
      {bottomPopupState.isActive && bottomPopupState.isCorrect ? (
        <div
          className={`${style.correctAnswer} animate__animated animate__flipInX`}
        >
          {correctAnswer}
        </div>
      ) : (
        <>
          <input
            ref={inputRef}
            className={style.inputField}
            type="text"
            value={inputVal}
            onChange={(e) => onChangeHandler(e)}
            onKeyUp={(e) => onKeyUpHandler(e)}
            onCopy={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            tabIndex={-1}
            autoFocus
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            inputMode="search"
          />
          <div className={style.wordText}></div>
        </>
      )}
    </div>
  )
}
