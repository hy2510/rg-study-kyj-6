import { useContext, useEffect, useRef, useState } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useTranslation } from 'react-i18next'
import { getClozeTest1 } from '@services/quiz/ClozeTestAPI'
import { saveUserAnswer } from '@services/studyApi'

import clozeTestCSS from '@stylesheets/cloze-test.module.scss'
import clozeTestCSSMobile from '@stylesheets/mobile/cloze-test.module.scss'

// Types [
import {
  IStudyData,
  IScoreBoardData as IScoreBoard,
  IUserAnswer,
} from '@interfaces/Common'
import { IClozeTest1Example } from '@interfaces/IClozeTest'
// ] Types

// utils & hooks
import { shuffle } from 'lodash'
import useStepIntro from '@hooks/common/useStepIntro'
import { useQuizTimer } from '@hooks/study/useQuizTimer'
import { useAnimation } from '@hooks/study/useAnimation'
import { useFetch } from '@hooks/study/useFetch'
import { useCurrentQuizNo } from '@hooks/study/useCurrentQuizNo'
import { useStudentAnswer } from '@hooks/study/useStudentAnswer'
import useStudyAudio from '@hooks/study/useStudyAudio'
import useBottomPopup from '@hooks/study/useBottomPopup'
import { useResult } from '@hooks/study/useResult'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

// components - common
import StepIntro from '@components/study/common-study/StepIntro'
import QuizHeader from '@components/study/common-study/QuizHeader'
import StudySideMenu from '@components/study/common-study/StudySideMenu'
import QuizBody from '@components/study/common-study/QuizBody'
import Container from '@components/study/common-study/Container'
import StudyPopupBottom from '@components/study/common-study/StudyPopupBottom'
import TestResult from '@components/study/common-study/TestResult'
import Gap from '@components/study/common-study/Gap'

// components - cloze test 1
import WrapperExample from '@components/study/cloze-test-01/WrapperExample'
import BtnPlaySentence from '@components/study/cloze-test-01/BtnPlaySentence'
import BoxQuestion from '@components/study/cloze-test-01/BoxQuestion'
import CorrectSentence from '@components/study/cloze-test-02/CorrectSentence'

const STEP_TYPE = 'Cloze Test'

const style = isMobile ? clozeTestCSSMobile : clozeTestCSS

export default function ClozeTest1(props: IStudyData) {
  const { t } = useTranslation()
  const { bookInfo, handler, studyInfo } = useContext(
    AppContext,
  ) as AppContextProps

  const STEP = props.currentStep

  const timer = useQuizTimer(() => {
    // timer가 0에 도달하면 호출되는 콜백함수 구현
    const isKeepGoing = confirm(
      t(
        'study.문제를 풀 수 있는 시간이 초과되었습니다. 계속 진행하시겠습니까?',
      ),
    )

    if (isKeepGoing) {
      checkAnswerTimeout()
    } else {
      window.onLogoutStudy()
    }
  })

  const animationManager = useAnimation()

  // 인트로 및 결과창
  const [introAnim, setIntroAnim] = useState<
    'animate__bounceInRight' | 'animate__bounceOutLeft'
  >('animate__bounceInRight')
  const { isStepIntro, closeStepIntro } = useStepIntro()
  const { isResultShow, changeResultShow } = useResult()

  // 사이드 메뉴
  const [isSideOpen, setSideOpen] = useState(false)

  const blankRef = useRef<HTMLSpanElement>(null)

  // 퀴즈 데이터 세팅
  const isWorking = useRef(false)
  const [quizData, recordedData] = useFetch(getClozeTest1, props, STEP) // 퀴즈 데이터 / 저장된 데이터
  const [quizNo, setQuizNo] = useState<number>(1) // 퀴즈 번호
  // 과거 기록
  const {
    scoreBoardData,
    setStudentAnswers,
    addStudentAnswer,
    makeUserAnswerData,
  } = useStudentAnswer(studyInfo.mode)

  // 예제
  const [exampleData, setExampleData] = useState<IClozeTest1Example[]>([])
  const [tryCount, setTryCount] = useState(0) // 시도 횟수
  const [incorrectCount, setIncorrectCount] = useState<number>(0) // 문제 틀린 횟수

  const [isCorrectSentence, setIsCorrectSentence] = useState<boolean>(false)

  // 정 / 오답시 하단에 나오는 correct / incorrect
  const { bottomPopupState, changeBottomPopupState } = useBottomPopup()

  // audio
  const { playState, playAudio, stopAudio } = useStudyAudio()

  // 인트로
  useEffect(() => {
    if (!isStepIntro && quizData) {
      timer.setup(quizData.QuizTime, true)
      playAudio(quizData.Quiz[quizNo - 1].Question.Sound)

      isWorking.current = false
    }
  }, [isStepIntro])

  useEffect(() => {
    if (quizData) {
      // 현재 퀴즈 번호
      const [currentQuizNo, tryCnt] = useCurrentQuizNo(
        studyInfo.mode,
        recordedData,
        quizData.QuizAnswerCount,
      )

      setTryCount(tryCnt)
      setIncorrectCount(tryCnt)

      if (studyInfo.mode === 'staff') {
        setExampleData(quizData.Quiz[currentQuizNo - 1].Examples)
      } else {
        setExampleData(shuffle(quizData.Quiz[currentQuizNo - 1].Examples))
      }

      setStudentAnswers(recordedData, quizData.QuizAnswerCount) // 기존 데이터를 채점판에 넣어주기
      setQuizNo(currentQuizNo) // 현재 퀴즈 번호
    }
  }, [quizData])

  // correct sentence
  useEffect(() => {
    if (quizData) {
      stopAudio()

      if (isCorrectSentence) {
        playAudio(quizData.Quiz[quizNo - 1].Question.Sound)
      } else {
        if (quizNo + 1 > quizData.Quiz.length) {
          changeResultShow(true)
        } else {
          setQuizNo(quizNo + 1)
        }
      }
    }
  }, [isCorrectSentence])

  // quizNo가 변경되면 다음 문제인 것으로 판단
  useEffect(() => {
    if (!isStepIntro && !isResultShow && quizData) {
      timer.setup(quizData.QuizTime, true)

      setIncorrectCount(0)
      setTryCount(0)

      if (studyInfo.mode === 'staff') {
        setExampleData(quizData.Quiz[quizNo - 1].Examples)
      } else {
        setExampleData(shuffle(quizData.Quiz[quizNo - 1].Examples))
      }

      playAudio(quizData.Quiz[quizNo - 1].Question.Sound)

      isWorking.current = false
    }
  }, [quizNo])

  // 로딩
  if (!quizData) return <>Loading...</>

  /** [ 정답 체크 ]
   * @target
   */
  const checkAnswer = async (
    target: EventTarget & HTMLDivElement,
    selectedWord: string = '',
  ) => {
    try {
      if (!isWorking.current) {
        isWorking.current = true
        timer.stop()

        const correctWord = quizData.Quiz[quizNo - 1].Examples[0].Text
        const isCorrect: boolean = correctWord === selectedWord

        // 채점판 만들기
        const answerData: IScoreBoard = {
          quizNo: quizNo,
          maxCount: quizData.QuizAnswerCount,
          answerCount: tryCount + 1,
          ox: isCorrect,
        }

        // 유저 답 데이터 생성
        const userAnswer: IUserAnswer = makeUserAnswerData({
          mobile: '',
          studyId: props.studyId,
          studentHistoryId: props.studentHistoryId,
          bookType: props.bookType,
          step: STEP,
          quizId: quizData.Quiz[quizNo - 1].QuizId,
          quizNo: quizData.Quiz[quizNo - 1].QuizNo,
          currentQuizNo: quizNo,
          correct: correctWord,
          selectedAnswer: selectedWord,
          tryCount: tryCount + 1,
          maxQuizCount: quizData.QuizAnswerCount,
          quizLength: quizData.Quiz.length,
          isCorrect: isCorrect,
          answerData: answerData,
          isFinishStudy: props.lastStep === STEP ? true : false,
        })

        const res = await saveUserAnswer(studyInfo.mode, userAnswer)

        if (Number(res.result) === 0) {
          if (res.resultMessage) {
            handler.finishStudy = {
              id: Number(res.result),
              cause: res.resultMessage,
            }
          }

          // 유저가 정답을 고른 경우
          if (isCorrect) {
            animationManager.play(target, [style.correct, 'animate__fadeIn'])
            blankRef.current?.classList.add(style.correctAnswer)
          } else {
            animationManager.play(target, [
              style.incorrect,
              'animate__headShake',
            ])

            blankRef.current?.classList.add(style.incorrectAnswer)
          }

          addStudentAnswer(answerData)

          if (!isCorrect) {
            setIncorrectCount(incorrectCount + 1)
          }

          setTryCount(tryCount + 1)

          afterCheckAnswer(isCorrect, target)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const afterCheckAnswer = (
    isCorrect: boolean,
    target: EventTarget & HTMLDivElement,
  ) => {
    changeBottomPopupState({
      isActive: true,
      isCorrect: isCorrect,
    })

    setTimeout(() => {
      changeBottomPopupState({
        isActive: false,
        isCorrect: false,
      })

      blankRef.current?.classList.remove(
        style.correctAnswer,
        style.incorrectAnswer,
      )

      if (!bookInfo.BookLevel.includes('1')) {
        changeCorrectSentenceState(true)
      } else {
        if (quizNo + 1 > quizData.Quiz.length) {
          changeResultShow(true)
        } else {
          setQuizNo(quizNo + 1)
        }
      }

      animationManager.remove(target, [
        style.correct,
        style.incorrect,
        'animate__fadeIn',
        'animate__headShake',
      ])
    }, 2000)
  }

  const checkAnswerTimeout = async () => {
    try {
      if (!isWorking.current) {
        isWorking.current = true
        timer.stop()

        const correctWord = quizData.Quiz[quizNo - 1].Examples[0].Text

        // 채점판 만들기
        const answerData: IScoreBoard = {
          quizNo: quizNo,
          maxCount: quizData.QuizAnswerCount,
          answerCount: tryCount + 1,
          ox: false,
        }

        // 유저 답 데이터 생성
        const userAnswer: IUserAnswer = makeUserAnswerData({
          mobile: '',
          studyId: props.studyId,
          studentHistoryId: props.studentHistoryId,
          bookType: props.bookType,
          step: STEP,
          quizId: quizData.Quiz[quizNo - 1].QuizId,
          quizNo: quizData.Quiz[quizNo - 1].QuizNo,
          currentQuizNo: quizNo,
          correct: correctWord,
          selectedAnswer: '',
          tryCount: tryCount + 1,
          maxQuizCount: quizData.QuizAnswerCount,
          quizLength: quizData.Quiz.length,
          isCorrect: false,
          answerData: answerData,
          isFinishStudy: props.lastStep === STEP ? true : false,
        })

        const res = await saveUserAnswer(studyInfo.mode, userAnswer)

        if (Number(res.result) === 0) {
          if (res.resultMessage) {
            handler.finishStudy = {
              id: Number(res.result),
              cause: res.resultMessage,
            }
          }

          addStudentAnswer(answerData)

          setIncorrectCount(incorrectCount + 1)

          setTryCount(tryCount + 1)

          afterCheckAnswerTimeout()
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const afterCheckAnswerTimeout = () => {
    changeBottomPopupState({
      isActive: true,
      isCorrect: false,
    })

    setTimeout(() => {
      changeBottomPopupState({
        isActive: false,
        isCorrect: false,
      })

      if (!bookInfo.BookLevel.includes('1')) {
        changeCorrectSentenceState(true)
      } else {
        if (quizNo + 1 > quizData.Quiz.length) {
          changeResultShow(true)
        } else {
          setQuizNo(quizNo + 1)
        }
      }
    }, 2000)
  }

  // 음원 재생
  const playSentence = () => {
    if (playState === '') {
      playAudio(quizData.Quiz[quizNo - 1].Question.Sound)
    } else {
      stopAudio()
    }
  }

  // correct sentence
  const changeCorrectSentenceState = (state: boolean) => {
    setIsCorrectSentence(state)
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
            comment={t('study.문장을 읽고 빈칸에 들어갈 알맞은 답을 고르세요.')}
            onStepIntroClozeHandler={() => {
              setIntroAnim('animate__bounceOutLeft')
            }}
          />
        </div>
      ) : (
        <>
          {isResultShow ? (
            <TestResult
              step={STEP}
              quizType={STEP_TYPE}
              quizAnswerCount={quizData.QuizAnswerCount}
              studentAnswer={scoreBoardData}
              onFinishActivity={props.onFinishActivity}
            />
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
                {!isCorrectSentence ? (
                  <Container
                    typeCSS={style.clozeTest1}
                    containerCSS={style.container}
                  >
                    {isMobile ? <></> : <Gap height={0} />}

                    <BtnPlaySentence
                      playState={playState}
                      playSentence={playSentence}
                    />

                    <BoxQuestion
                      blankRef={blankRef}
                      question={quizData.Quiz[quizNo - 1].Question.Text}
                      correctAnswer={quizData.Quiz[quizNo - 1].Examples[0].Text}
                    />

                    {isMobile ? <Gap height={20} /> : <Gap height={30} />}

                    <WrapperExample
                      correctText={quizData.Quiz[quizNo - 1].Examples[0].Text}
                      exampleData={exampleData}
                      checkAnswer={checkAnswer}
                    />
                  </Container>
                ) : (
                  <CorrectSentence
                    playState={playState}
                    sentence={quizData.Quiz[quizNo - 1].Question.Text.replace(
                      '┒',
                      quizData.Quiz[quizNo - 1].Examples[0].Text,
                    )}
                    changeCorrectSentenceState={changeCorrectSentenceState}
                    playSentence={playSentence}
                  />
                )}
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
