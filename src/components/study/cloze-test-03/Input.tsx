import clozeTestCSS from '@stylesheets/cloze-test.module.scss'
import clozeTestCSSMobile from '@stylesheets/mobile/cloze-test.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type InputValue = {
  text: string
  isCorrected: boolean
}

type InputProps = {
  inputRefs: React.MutableRefObject<HTMLInputElement[]>
  isWorking: boolean
  inputIndex: number
  currentIndex: number
  inputValues: InputValue[]
  correctText: string
  changeInputValue: (index: number, newValue: string) => void
  checkAnswer: () => void
  changeInputIndex: (index: number) => void
}

const style = isMobile ? clozeTestCSSMobile : clozeTestCSS

export default function Input({
  inputRefs,
  isWorking,
  inputIndex,
  currentIndex,
  inputValues,
  correctText,
  changeInputValue,
  checkAnswer,
  changeInputIndex,
}: InputProps) {
  /**
   * 키다운 이벤트
   * @param e input
   */
  const onKeydownHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isWorking) e.preventDefault()

    if (e.key === 'Tab' || (e.altKey && e.key === 'Tab')) {
      // 탭을 누르거나 알트 + 탭을 누른 경우 이벤트 제거 및 포커싱
      e.preventDefault()
      inputRefs?.current[currentIndex].focus()
    }
  }

  /**
   * 키보드 입력 이벤트
   * @param e input
   */
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    // 유효성 검사
    // 영어랑 마침표만 허용 - 추가될 수 있음
    const regex = /^[a-zA-Z-'’‘” ]+(?:'){0,1}[a-zA-Z]?$/g
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

    changeInputValue(currentIndex, text)
  }

  /**
   * 키보드 입력 이벤트
   * @param e input
   * @param index index
   */
  const onKeyUpHandler = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    const text = e.currentTarget.value

    if (e.key === 'Enter' && text !== '') {
      // 유저가 엔터를 친 경우는 오답
      const lastInputIndex = getLastInputIndex(inputRefs, index)

      if (lastInputIndex === -1) {
        // 마지막 input인 경우
        changeInputIndex(-1)
        checkAnswer()
      } else {
        // 마지막 input이 아닌 경우
        const nextInputIndex = getNextInputIndex(inputRefs, index)

        changeInputIndex(nextInputIndex)
      }
    }
  }

  /**
   * 다음 input이 존재하는지 확인
   * @param inputRefs input
   * @param currentInputIndex 현재 Input index
   * @returns 다음 input의 index
   */
  const getNextInputIndex = (
    inputRefs: React.MutableRefObject<HTMLInputElement[]>,
    currentInputIndex: number,
  ): number => {
    const nextInputIndex = inputRefs?.current.findIndex(
      (input, index) =>
        !inputValues[index].isCorrected && index > currentInputIndex,
    )

    return nextInputIndex
  }

  /**
   * 마지막 input index 구하기
   * @param inputRefs input
   * @param currentInputIndex 현재 input index
   * @returns 마지막 input index
   */
  const getLastInputIndex = (
    inputRefs: React.MutableRefObject<HTMLInputElement[]>,
    currentInputIndex: number,
  ): number => {
    const nextInputIndex = inputRefs?.current.findLastIndex(
      (input: HTMLInputElement, index: number) =>
        !inputValues[index].isCorrected && index > currentInputIndex,
    )

    return nextInputIndex
  }

  const onFocusHandler = () => {
    changeInputIndex(inputIndex)
  }

  return (
    <span
      className={`${style.answerBox} ${
        currentIndex === inputIndex ? style.currentOrder : ''
      }`}
    >
      {currentIndex === inputIndex ? (
        <>
          {/* 풀어야하는 인풋인 경우 */}
          <span className={style.currentInput}>
            <input
              ref={(el: HTMLInputElement) =>
                (inputRefs.current[inputIndex] = el)
              }
              id="textFild"
              style={{
                width: `${correctText.length * 15.6}px`,
              }}
              type="text"
              value={inputValues[currentIndex].text}
              onKeyDown={(e) => onKeydownHandler(e)}
              onChange={(e) => onChangeHandler(e)}
              onKeyUp={(e) => onKeyUpHandler(e, currentIndex)}
              onCopy={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              inputMode="search"
              autoFocus
              tabIndex={-1}
            />
          </span>
        </>
      ) : (
        <>
          {/* 풀어야하는 인풋이 아닌 경우 */}
          <span
            className={`${style.otherInput} ${
              inputValues[inputIndex].isCorrected && style.correct
            }`}
          >
            <input
              ref={(el: HTMLInputElement) =>
                (inputRefs.current[inputIndex] = el)
              }
              style={{
                width: `${correctText.length * 15.6}px`,
              }}
              value={inputValues[inputIndex].text}
              onFocus={() => onFocusHandler()}
              disabled={
                inputValues[inputIndex].isCorrected ||
                (inputIndex > currentIndex &&
                  inputValues[inputIndex].text === '')
                  ? true
                  : false
              }
            />
          </span>
        </>
      )}
    </span>
  )
}
