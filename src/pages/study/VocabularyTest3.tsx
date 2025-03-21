import { useEffect, useState, useContext, useRef } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useTranslation } from 'react-i18next'
import { deletePenalty } from '@services/studyApi'
import {
  getVocabularyTest3,
  getVocabularyHint,
} from '@services/quiz/VocabularyAPI'

import vocabularyCSS from '@stylesheets/vocabulary-test.module.scss'
import vocabularyCSSMobile from '@stylesheets/mobile/vocabulary-test.module.scss'

// Types [
import {
  IStudyData,
  IScoreBoardData as IScoreBoard,
  IUserAnswer,
} from '@interfaces/Common'
// ] Types

// utils & hooks
import useStepIntro from '@hooks/common/useStepIntro'
import { useQuizTimer } from '@hooks/study/useQuizTimer'
import { useFetch } from '@hooks/study/useFetch'
import { useCurrentQuizNo } from '@hooks/study/useCurrentQuizNo'
import { useStudentAnswer } from '@hooks/study/useStudentAnswer'
import useStudyAudio from '@hooks/study/useStudyAudio'
import { useResult } from '@hooks/study/useResult'
import { saveUserAnswer } from '@services/studyApi'
import useBottomPopup from '@hooks/study/useBottomPopup'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

// components - common
import StepIntro from '@components/study/common-study/StepIntro'
import QuizHeader from '@components/study/common-study/QuizHeader'
import StudySideMenu from '@components/study/common-study/StudySideMenu'
import QuizBody from '@components/study/common-study/QuizBody'
import Gap from '@components/study/common-study/Gap'
import Container from '@components/study/common-study/Container'
import StudyPopupBottom from '@components/study/common-study/StudyPopupBottom'
import TestResult from '@components/study/common-study/TestResult'

// components - vocabulary test 3
import WrapperCard from '@components/study/vocabulary-test-03/WrapperCard'
import WrapperPenalty from '@components/study/vocabulary-test-03/WrapperPenalty'
import BtnHint from '@components/study/vocabulary-test-03/BtnHint'

const STEP_TYPE = 'Vocabulary Test'

const style = isMobile ? vocabularyCSSMobile : vocabularyCSS

export default function VocabularyTest3(props: IStudyData) {
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
      checkAnswer('')
    } else {
      window.onLogoutStudy()
    }
  })

  // 인트로 및 결과창
  const [introAnim, setIntroAnim] = useState<
    'animate__bounceInRight' | 'animate__bounceOutLeft'
  >('animate__bounceInRight')
  const { isStepIntro, closeStepIntro } = useStepIntro() // 데이터 가져오기
  const { isResultShow, changeResultShow } = useResult()

  // 사이드 메뉴
  const [isSideOpen, setSideOpen] = useState(false)

  // 퀴즈 데이터 세팅
  const isWorking = useRef(true)
  // 퀴즈 데이터 / 저장된 데이터
  const [quizData, recordedData] = useFetch(getVocabularyTest3, props, STEP)
  const [quizNo, setQuizNo] = useState<number>(1) // 퀴즈 번호
  const {
    scoreBoardData,
    setStudentAnswers,
    addStudentAnswer,
    makeUserAnswerData,
  } = useStudentAnswer(studyInfo.mode)
  const [tryCount, setTryCount] = useState(0) // 시도 횟수
  const [incorrectCount, setIncorrectCount] = useState<number>(0) // 문제 틀린 횟수

  // 힌트
  const [isHint, setIsHint] = useState<boolean>(false)
  const [tryHintCount, setTryHintCount] = useState(0)
  const [isHintOpened, setHintOpened] = useState<boolean>(false)

  // 패널티
  const [isPenalty, setIsPenalty] = useState<boolean>(false)

  // 정 / 오답시 하단에 나오는 correct / incorrect
  const { bottomPopupState, changeBottomPopupState } = useBottomPopup()

  // input ref
  const [inputVal, setInputVal] = useState<string>('')

  // audio
  const { playState, playAudio, stopAudio } = useStudyAudio()

  // 인트로 클릭 후
  useEffect(() => {
    if (!isStepIntro && quizData && !isPenalty) {
      timer.setup(quizData.QuizTime, true)

      if (studyInfo.mode === 'review' && Number(bookInfo.Average) >= 70) {
        setInputVal(quizData.Quiz[quizNo - 1].Question.Text)
      } else if (studyInfo.mode === 'staff') {
        setInputVal(quizData.Quiz[quizNo - 1].Question.Text)
      } else {
        setInputVal('')
      }

      isWorking.current = false
    }
  }, [isStepIntro])

  // 퀴즈 데이터
  useEffect(() => {
    if (quizData) {
      // 현재 퀴즈 번호
      const [currentQuizNo, tryCnt] = useCurrentQuizNo(
        studyInfo.mode,
        recordedData,
        quizData.QuizAnswerCount,
      )

      // 과거 기록 동기화
      if (recordedData.length > 0) {
        if (
          quizData.IsEnablePenaltyReview &&
          recordedData[recordedData.length - 1].PenaltyWord !== ''
        ) {
          // 기존에 패널티를 안하고 넘어간 경우
          setIsPenalty(true)

          setTryCount(quizData.QuizAnswerCount)
          setIncorrectCount(quizData.QuizAnswerCount)
          setQuizNo(recordedData[recordedData.length - 1].CurrentQuizNo)
        } else {
          // 패널티가 없는 경우
          setTryCount(tryCnt)
          setIncorrectCount(tryCnt)
          setQuizNo(currentQuizNo)
        }
      } else {
        setTryCount(tryCnt)
        setIncorrectCount(tryCnt)
        setQuizNo(currentQuizNo)
      }

      if (quizData.Hint.IsEnabled && quizData.Hint.Try) {
        if (studyInfo.mode === 'student') {
          setTryHintCount(quizData.Hint.Try)
        } else {
          setTryHintCount(0)
        }
      }

      setStudentAnswers(recordedData, quizData.QuizAnswerCount) // 기존 데이터를 채점판에 넣어주기
    }
  }, [quizData])

  // 퀴즈 번호
  useEffect(() => {
    if (!isStepIntro && !isResultShow && quizData) {
      if (studyInfo.mode === 'review' && Number(bookInfo.Average) >= 70) {
        setInputVal(quizData.Quiz[quizNo - 1].Question.Text)
      } else if (studyInfo.mode === 'staff') {
        setInputVal(quizData.Quiz[quizNo - 1].Question.Text)
      } else {
        setInputVal('')
      }

      setTryCount(0)
      setIncorrectCount(0)
      setHintOpened(false)
      setIsHint(false)

      if (!isStepIntro) timer.setup(quizData.QuizTime, true)

      isWorking.current = false
    }
  }, [quizNo])

  // 패널티
  useEffect(() => {
    if (!isPenalty && quizData) {
      // isPenalty가 true에서 false로 바뀐 경우 패널티를 완료한 것으로 판단
      const clearPenalty = async () => {
        const isLastQuiz = quizNo + 1 > quizData.Quiz.length ? true : false

        const res = await deletePenalty({
          mobile: '',
          bookType: props.bookType,
          studyId: props.studyId,
          studentHistoryId: props.studentHistoryId,
          step: `${STEP}`,
          quizId: quizData.Quiz[quizNo - 1].QuizId,
          isLastQuiz: isLastQuiz,
          isFinishStudy: isLastQuiz && props.lastStep === STEP ? true : false,
        })

        if (Number(res.result) === 0) {
          if (res.resultMessage) {
            handler.finishStudy = {
              id: Number(res.result),
              cause: res.resultMessage,
            }
          }

          if (quizNo + 1 > quizData.Quiz.length) {
            changeResultShow(true)
          } else {
            timer.setup(quizData.QuizTime, true)
            setQuizNo(quizNo + 1)
          }
        }
      }

      clearPenalty()
    }
  }, [isPenalty])

  // 로딩
  if (!quizData) return <>Loading...</>

  /**
   * 정답 체크
   */
  const checkAnswer = async (selectedAnswer: string) => {
    try {
      if (!isWorking.current) {
        isWorking.current = true

        const isCorrect =
          quizData.Quiz[quizNo - 1].Question.Text ===
          selectedAnswer.trimStart().trimEnd()
            ? true
            : false

        if (isCorrect) {
          changeInputVal(selectedAnswer)
        }

        // 채점판
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
          correct: quizData.Quiz[quizNo - 1].Question.Text,
          selectedAnswer: selectedAnswer.trimStart().trimEnd(),
          tryCount: tryCount + 1,
          maxQuizCount: quizData.QuizAnswerCount,
          quizLength: quizData.Quiz.length,
          isCorrect: isCorrect,
          answerData: answerData,
          isEnabledPenalty: quizData.IsEnablePenaltyReview,
          isFinishStudy: props.lastStep === STEP ? true : false,
        })

        timer.stop()

        changeBottomPopupState({
          isActive: true,
          isCorrect: isCorrect,
        })

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

          afterCheckAnswer(isCorrect, tryCount + 1)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  // 정답 체크 후
  const afterCheckAnswer = (isCorrect: boolean, tryCount: number) => {
    setTimeout(() => {
      if (isCorrect) {
        if (quizNo + 1 > quizData.Quiz.length) {
          playAudio(quizData.Quiz[quizNo - 1].Question.Sound, () => {
            stopAudio()

            changeBottomPopupState({
              isActive: false,
              isCorrect: false,
            })

            changeResultShow(true)
          })
        } else {
          playAudio(quizData.Quiz[quizNo - 1].Question.Sound, () => {
            stopAudio()

            changeBottomPopupState({
              isActive: false,
              isCorrect: false,
            })

            setQuizNo(quizNo + 1)
          })
        }
      } else {
        changeBottomPopupState({
          isActive: false,
          isCorrect: false,
        })

        if (tryCount >= quizData.QuizAnswerCount) {
          if (quizData.IsEnablePenaltyReview) {
            setInputVal('')
            changePenaltyState(true)
          } else {
            if (quizNo + 1 > quizData.Quiz.length) {
              changeResultShow(true)
            } else {
              timer.setup(quizData.QuizTime, true)
              setQuizNo(quizNo + 1)
            }
          }
        } else {
          timer.setup(quizData.QuizTime, true)

          if (
            !quizData.Hint.IsEnabled &&
            tryCount === quizData.QuizAnswerCount - 1
          ) {
            playAudio(quizData.Quiz[quizNo - 1].Question.Sound)
          }

          isWorking.current = false
        }
      }
    }, 1000)
  }

  // input 값 변경
  const changeInputVal = (value: string) => {
    setInputVal(value)
  }

  // 패널티 상태 변경
  const changePenaltyState = (state: boolean) => {
    setIsPenalty(state)
  }

  /**
   * 힌트 열기
   */
  const toggleHint = async () => {
    try {
      if (isHint) {
        stopAudio()
        setIsHint(false)
      } else {
        if (!isHintOpened) {
          if (studyInfo.mode === 'student') {
            const hint = await getVocabularyHint(
              props.studyId,
              props.studentHistoryId,
              quizNo,
            )

            if (hint.ErrorNo === 0 || isHintOpened) {
              setHintOpened(true)
              setIsHint(true)
              setTryHintCount(hint.TryHint)
            }
          } else {
            setHintOpened(true)
            setIsHint(true)
            setTryHintCount(tryHintCount + 1)
          }
        } else {
          setIsHint(true)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const playHint = () => {
    if (playState === 'playing') {
      stopAudio()
    } else {
      playAudio(quizData.Quiz[quizNo - 1].Question.Sound)
    }
  }

  /**
   * 패널티 음원 재생
   * @param cb 패널티 음원 재생 후 콜백 함수
   */
  const playPenalty = (cb: any) => {
    stopAudio()

    const cbAfterPlayPenalty = () => {
      stopAudio()
      cb()
    }

    playAudio(quizData.Quiz[quizNo - 1].Question.Sound, cbAfterPlayPenalty)
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
            comment={t('study.뜻을 보고 올바른 단어를 입력하세요.')}
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
                {!isPenalty ? (
                  <Container
                    typeCSS={style.vocabularyTest3}
                    containerCSS={style.container}
                  >
                    <Gap height={20} />

                    <WrapperCard
                      isWorking={isWorking.current}
                      bottomPopupState={bottomPopupState}
                      isSideOpen={isSideOpen}
                      isHint={isHint}
                      quizData={quizData}
                      quizNo={quizNo}
                      inputVal={inputVal}
                      changeInputVal={changeInputVal}
                      checkAnswer={checkAnswer}
                    />

                    <>
                      {quizData.Hint.IsEnabled && (
                        <BtnHint
                          isHint={isHint}
                          playState={playState}
                          remainCount={tryHintCount}
                          totalCount={quizData.Hint.Max}
                          toggleHint={toggleHint}
                          playHint={playHint}
                        />
                      )}
                    </>
                  </Container>
                ) : (
                  <WrapperPenalty
                    isSideOpen={isSideOpen}
                    correctAnswer={quizData.Quiz[quizNo - 1].Question.Text}
                    playPenalty={playPenalty}
                    changePenaltyState={changePenaltyState}
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
