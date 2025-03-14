import vocabularyCSS from '@stylesheets/vocabulary-test.module.scss'
import vocabularyCSSMobile from '@stylesheets/mobile/vocabulary-test.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { IVocabulary3Test } from '@interfaces/IVocabulary'
import { BottomPopupStateProps } from '@hooks/study/useBottomPopup'
type WrapperCardProps = {
  isWorking: boolean
  bottomPopupState: BottomPopupStateProps
  isSideOpen: boolean
  isHint: boolean
  quizData: IVocabulary3Test
  quizNo: number
  inputVal: string
  changeInputVal: (value: string) => void
  checkAnswer: (selectedAnswer: string) => Promise<void>
}

import { IcoReturn } from '@components/common/Icons'

import Input from './Input'
import Gap from '@components/study/common-study/Gap'
import Mean from './Mean'

const style = isMobile ? vocabularyCSSMobile : vocabularyCSS

export default function WrapperCard({
  isWorking,
  bottomPopupState,
  isSideOpen,
  isHint,
  quizData,
  quizNo,
  inputVal,
  changeInputVal,
  checkAnswer,
}: WrapperCardProps) {
  return (
    <div className={style.wordCard}>
      <div className={style.wordTyping}>
        <div style={{ width: isMobile ? 0 : 70 }}></div>

        {/* 인풋 */}
        <Input
          isWorking={isWorking}
          bottomPopupState={bottomPopupState}
          isSideOpen={isSideOpen}
          isHint={isHint}
          inputVal={inputVal}
          correctAnswer={quizData.Quiz[quizNo - 1].Question.Text}
          changeInputVal={changeInputVal}
          checkAnswer={checkAnswer}
        />

        {bottomPopupState.isActive && bottomPopupState.isCorrect ? (
          <div className={style.enterButton}></div>
        ) : (
          <>
            {/*  버튼 */}
            <div
              className={style.enterButton}
              onClick={() => {
                if (inputVal !== '') {
                  checkAnswer(inputVal)
                }
              }}
            >
              <div className={style.enterIcon}>
                <IcoReturn width={20} height={20} />
              </div>
            </div>
          </>
        )}
      </div>

      <Gap height={20} />

      {/* 뜻 */}
      <Mean
        meanData={quizData.Quiz[quizNo - 1]}
        mainMeanLang={quizData.MainMeanLanguage}
      />
    </div>
  )
}
