import { useEffect, useState, useContext, useRef } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useTranslation } from 'react-i18next'
import { getVocabularyTest4 } from '@services/quiz/VocabularyAPI'

import vocabularyCSS from '@stylesheets/vocabulary-test.module.scss'
import vocabularyCSSMobile from '@stylesheets/mobile/vocabulary-test.module.scss'

// Types [
import {
  IStudyData,
  IScoreBoardData as IScoreBoard,
  IUserAnswer,
} from '@interfaces/Common'
import { IVocabulary4Example } from '@interfaces/IVocabulary'
// ] Types

// utils & hooks
import { shuffle } from 'lodash'
import useStepIntro from '@hooks/common/useStepIntro'
import { useQuizTimer } from '@hooks/study/useQuizTimer'
import { useAnimation } from '@hooks/study/useAnimation'
import { useFetch } from '@hooks/study/useFetch'
import { useCurrentQuizNo } from '@hooks/study/useCurrentQuizNo'
import { useStudentAnswer } from '@hooks/study/useStudentAnswer'
import useBottomPopup from '@hooks/study/useBottomPopup'
import { useResult } from '@hooks/study/useResult'
import { saveUserAnswer } from '@services/studyApi'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

// components - common
import StepIntro from '@components/study/common-study/StepIntro'
import QuizHeader from '@components/study/common-study/QuizHeader'
import StudySideMenu from '@components/study/common-study/StudySideMenu'
import QuizBody from '@components/study/common-study/QuizBody'
import Gap from '@components/study/common-study/Gap'
import StudyPopupBottom from '@components/study/common-study/StudyPopupBottom'
import TestResult from '@components/study/common-study/TestResult'
import Container from '@components/study/common-study/Container'

import WrapperExample from '@components/study/vocabulary-test-04/WrapperExample'
import BoxQuestion from '@components/study/vocabulary-test-04/BoxQuestion'

const STEP_TYPE = 'Vocabulary Test'

const style = isMobile ? vocabularyCSSMobile : vocabularyCSS

export default function VocabularyTest4(props: IStudyData) {
  const { t } = useTranslation()
  const { handler, studyInfo } = useContext(AppContext) as AppContextProps
  const STEP = props.currentStep

  const timer = useQuizTimer(() => {
    // timer가 0에 도달하면 호출되는 콜백함수 구현
    const isKeepGoing = confirm(
      t(
        'study.문제를 풀 수 있는 시간이 초과되었습니다. 계속 진행하시겠습니까?',
      ),
    )

    if (isKeepGoing) {
      checkAnswerTimeOut()
    } else {
      window.onLogoutStudy()
    }
  })

  const animationManager = useAnimation()

  // 인트로
  const [introAnim, setIntroAnim] = useState<
    'animate__bounceInRight' | 'animate__bounceOutLeft'
  >('animate__bounceInRight')

  // 인트로 및 결과창
  const { isStepIntro, closeStepIntro } = useStepIntro() // 데이터 가져오기
  const { isResultShow, changeResultShow } = useResult()

  // 사이드 메뉴
  const [isSideOpen, setSideOpen] = useState(false)

  // 퀴즈 데이터 세팅
  const isWorking = useRef(true)
  // 퀴즈 데이터 / 저장된 데이터
  const [quizData, recordedData] = useFetch(getVocabularyTest4, props, STEP)
  const [quizNo, setQuizNo] = useState<number>(1) // 퀴즈 번호
  const {
    scoreBoardData,
    setStudentAnswers,
    addStudentAnswer,
    makeUserAnswerData,
  } = useStudentAnswer(studyInfo.mode)
  const [exampleData, setExamples] = useState<IVocabulary4Example[]>([]) // 과거 기록
  const [tryCount, setTryCount] = useState(0) // 시도 횟수
  const [incorrectCount, setIncorrectCount] = useState<number>(0) // 문제 틀린 횟수

  // 정 / 오답시 하단에 나오는 correct / incorrect
  const { bottomPopupState, changeBottomPopupState } = useBottomPopup()

  // 인트로
  useEffect(() => {
    if (!isStepIntro && quizData) {
      timer.setup(quizData.QuizTime, true)

      isWorking.current = false
    }
  }, [isStepIntro])

  useEffect(() => {
    if (quizData) {
      try {
        // 현재 퀴즈 번호
        const [currentQuizNo, tryCnt] = useCurrentQuizNo(
          studyInfo.mode,
          recordedData,
          quizData.QuizAnswerCount,
        )

        timer.setup(quizData.QuizTime, true)

        setTryCount(tryCnt)
        setIncorrectCount(tryCnt)

        if (studyInfo.mode === 'staff') {
          setExamples(quizData.Quiz[currentQuizNo - 1].Examples)
        } else {
          setExamples(shuffle(quizData.Quiz[currentQuizNo - 1].Examples))
        }

        setStudentAnswers(recordedData, quizData.QuizAnswerCount) // 기존 데이터를 채점판에 넣어주기
        setQuizNo(currentQuizNo)
      } catch (e) {
        console.error(e)
      }
    }
  }, [quizData])

  useEffect(() => {
    if (!isStepIntro && !isResultShow && quizData) {
      timer.setup(quizData.QuizTime, true)

      setTryCount(0)
      setIncorrectCount(0)

      if (studyInfo.mode === 'staff') {
        setExamples(quizData.Quiz[quizNo - 1].Examples)
      } else {
        setExamples(shuffle(quizData.Quiz[quizNo - 1].Examples))
      }

      isWorking.current = false
    }
  }, [quizNo])

  // 로딩
  if (!quizData) return <>Loading...</>

  // 정답 체크
  const checkAnswer = async (
    target: EventTarget & HTMLDivElement,
    selectedText: string,
  ) => {
    try {
      if (!isWorking.current) {
        isWorking.current = true

        const isCorrect =
          quizData.Quiz[quizNo - 1].Question.Text === selectedText
            ? true
            : false

        // 채점판
        const answerData: IScoreBoard = {
          quizNo: quizNo,
          maxCount: quizData.QuizAnswerCount,
          answerCount: tryCount + 1,
          ox: isCorrect,
        }

        // 유저 답안
        const userAnswer: IUserAnswer = makeUserAnswerData({
          mobile: '',
          studyId: props.studyId,
          studentHistoryId: props.studentHistoryId,
          bookType: props.bookType,
          step: STEP,
          quizId: quizData.Quiz[quizNo - 1].QuizId,
          quizNo: quizData.Quiz[quizNo - 1].QuizNo,
          currentQuizNo: quizNo,
          correct: quizData.Quiz[quizNo - 1].Question.Text,
          selectedAnswer: selectedText,
          tryCount: tryCount + 1,
          maxQuizCount: quizData.QuizAnswerCount,
          quizLength: quizData.Quiz.length,
          isCorrect: isCorrect,
          answerData: answerData,
          isFinishStudy: props.lastStep === STEP ? true : false,
        })

        timer.stop()
        // 서버에 유저 답안 저장
        const res = await saveUserAnswer(studyInfo.mode, userAnswer)

        if (Number(res.result) === 0) {
          if (res.resultMessage) {
            handler.finishStudy = {
              id: Number(res.result),
              cause: res.resultMessage,
            }
          }

          if (!isCorrect) {
            setIncorrectCount(incorrectCount + 1)
          }

          setTryCount(tryCount + 1)

          addStudentAnswer(answerData)

          afterCheckAnswer(target, isCorrect)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const afterCheckAnswer = (
    target: EventTarget & HTMLDivElement,
    isCorrect: boolean,
  ) => {
    changeBottomPopupState({
      isActive: true,
      isCorrect: isCorrect,
    })

    if (isCorrect) {
      animationManager.play(target, ['animate__fadeIn', style.correct])
    } else {
      animationManager.play(target, ['animate__headShake', style.incorrect])
    }
  }

  // 애니메이션 완료 후
  const onExampleAnimationEndHandler = (
    target: EventTarget & HTMLDivElement,
  ) => {
    setTimeout(() => {
      changeBottomPopupState({
        isActive: false,
        isCorrect: false,
      })

      animationManager.remove(target, [
        style.correct,
        style.incorrect,
        'animate__fadeIn',
        'animate__headShake',
      ])

      if (quizNo + 1 <= quizData.Quiz.length) {
        setQuizNo(quizNo + 1)
      } else {
        changeResultShow(true)
      }
    }, 1000)
  }

  const checkAnswerTimeOut = async () => {
    try {
      if (!isWorking.current) {
        isWorking.current = true

        // 유저 답안
        const userAnswer: IUserAnswer = {
          mobile: '',
          studentHistoryId: props.studentHistoryId,
          studyId: props.studyId,
          bookType: props.bookType,
          step: `${STEP}`,
          quizId: quizData.Quiz[quizNo - 1].QuizId,
          quizNo: quizData.Quiz[quizNo - 1].QuizNo,
          currentQuizNo: quizNo,
          correct: quizData.Quiz[quizNo - 1].Question.Text,
          studentAnswer: '',
          answerCount: tryCount + 1,
        }

        timer.stop()
        // 서버에 유저 답안 저장
        const res = await saveUserAnswer(studyInfo.mode, userAnswer)

        if (Number(res.result) === 0) {
          if (res.resultMessage) {
            handler.finishStudy = {
              id: Number(res.result),
              cause: res.resultMessage,
            }
          }

          // 채점판
          const answerData: IScoreBoard = {
            quizNo: quizNo,
            maxCount: quizData.QuizAnswerCount,
            answerCount: tryCount + 1,
            ox: false,
          }

          setIncorrectCount(incorrectCount + 1)

          setTryCount(tryCount + 1)

          addStudentAnswer(answerData)

          changeBottomPopupState({
            isActive: true,
            isCorrect: false,
          })

          afterCheckAnswerTimeOut()
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const afterCheckAnswerTimeOut = () => {
    setTimeout(() => {
      changeBottomPopupState({
        isActive: false,
        isCorrect: false,
      })

      if (quizNo + 1 > quizData.Quiz.length) {
        changeResultShow(true)
      } else {
        setQuizNo(quizNo + 1)
      }
    }, 1500)
  }

  /**
   * 헤더 메뉴 클릭하는 기능
   */
  const changeSideMenu = (state: boolean) => {
    setSideOpen(state)
  }

  return (
    <>
      {isStepIntro ? (
        <div
          className={`animate__animated ${introAnim}`}
          onAnimationEnd={() => {
            if (introAnim === 'animate__bounceOutLeft') {
              closeStepIntro()
            }
          }}
        >
          <StepIntro
            step={STEP}
            quizType={STEP_TYPE}
            comment={t('study.뜻을 보고 올바른 단어를 고르세요.')}
            onStepIntroClozeHandler={() => {
              setIntroAnim('animate__bounceOutLeft')
            }}
          />
        </div>
      ) : (
        <>
          {isResultShow ? (
            <>
              <TestResult
                step={STEP}
                quizType={STEP_TYPE}
                quizAnswerCount={quizData.QuizAnswerCount}
                studentAnswer={scoreBoardData}
                onFinishActivity={props.onFinishActivity}
              />
            </>
          ) : (
            <>
              <QuizHeader
                quizNumber={quizNo}
                totalQuizCnt={Object.keys(quizData.Quiz).length}
                life={quizData.QuizAnswerCount - incorrectCount}
                timeMin={timer.time.timeMin}
                timeSec={timer.time.timeSec}
                changeSideMenu={changeSideMenu}
              />

              <div
                className={`${style.comment} animate__animated animate__fadeInLeft`}
              >
                {STEP_TYPE}
              </div>

              <QuizBody>
                {isMobile ? <></> : <Gap height={15} />}

                <Container
                  typeCSS={style.vocabularyTest4}
                  containerCSS={style.container}
                >
                  {/* question */}
                  <BoxQuestion quizData={quizData} quizNo={quizNo} />

                  <Gap height={20} />

                  {/* examples */}
                  <WrapperExample
                    correctText={quizData.Quiz[quizNo - 1].Question.Text}
                    exampleData={exampleData}
                    checkAnswer={checkAnswer}
                    onExampleAnimationEndHandler={onExampleAnimationEndHandler}
                  />
                </Container>

                {isMobile ? <Gap height={5} /> : <Gap height={15} />}
              </QuizBody>

              {isSideOpen && (
                <StudySideMenu
                  isSideOpen={isSideOpen}
                  currentStep={STEP}
                  currentStepType={STEP_TYPE}
                  quizLength={quizData.Quiz.length}
                  maxAnswerCount={quizData.QuizAnswerCount}
                  changeSideMenu={changeSideMenu}
                  scoreBoardData={scoreBoardData}
                  changeStep={props.changeStep}
                />
              )}

              <StudyPopupBottom bottomPopupState={bottomPopupState} />
            </>
          )}
        </>
      )}
    </>
  )
}
