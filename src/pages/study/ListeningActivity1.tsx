import { useEffect, useState, useContext, useRef } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useTranslation } from 'react-i18next'
import { saveUserAnswer } from '@services/studyApi'
import { getListeningActivity1 } from '@services/quiz/ListeningActivityApi'

import listeningCSS from '@stylesheets/listening-activity.module.scss'
import listeningCSSMobile from '@stylesheets/mobile/listening-activity.module.scss'

// Types [
import {
  IStudyData,
  IScoreBoardData as IScoreBoard,
  IUserAnswer,
} from '@interfaces/Common'
import { IListeningActivity1Example } from '@interfaces/IListeningActivity'
// ] Types

// utils & hooks
import { shuffle } from 'lodash'
import { useQuizTimer } from '@hooks/study/useQuizTimer'
import useStepIntro from '@hooks/common/useStepIntro'
import useStudyAudio from '@hooks/study/useStudyAudio'
import { useFetch } from '@hooks/study/useFetch'
import { useCurrentQuizNo } from '@hooks/study/useCurrentQuizNo'
import { useStudentAnswer } from '@hooks/study/useStudentAnswer'
import { useAnimation } from '@hooks/study/useAnimation'
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
import Gap from '@components/study/common-study/Gap'
import Container from '@components/study/common-study/Container'
import StudyPopupBottom from '@components/study/common-study/StudyPopupBottom'
import TestResult from '@components/study/common-study/TestResult'

// components - listening activity 1
import BtnPlayWord from '@components/study/listening-activity-01/BtnPlayWord'
import CardWord from '@components/study/listening-activity-01/CardWord'

const STEP_TYPE = 'Listening Activity'

const style = isMobile ? listeningCSSMobile : listeningCSS

export default function ListeningActivity1(props: IStudyData) {
  const { t } = useTranslation()
  const { handler, studyInfo } = useContext(AppContext) as AppContextProps
  const STEP = props.currentStep

  const timer = useQuizTimer(() => {
    // timer가 0에 도달하면 호출되는 콜백함수 구현
    window.onLogoutStudy()
  })

  // 애니메이션 hook
  const animationManager = useAnimation()

  // 인트로 및 결과창
  const [introAnim, setIntroAnim] = useState<
    'animate__bounceInRight' | 'animate__bounceOutLeft'
  >('animate__bounceInRight')
  const { isStepIntro, closeStepIntro } = useStepIntro()
  const { isResultShow, changeResultShow } = useResult()

  // 사이드 메뉴
  const [isSideOpen, setSideOpen] = useState(false)

  // 퀴즈 데이터 세팅
  const [quizData, recordedData] = useFetch(getListeningActivity1, props, STEP)
  const [quizNo, setQuizNo] = useState<number>(1) // 퀴즈 번호

  // 과거 기록
  const {
    scoreBoardData,
    setStudentAnswers,
    addStudentAnswer,
    makeUserAnswerData,
  } = useStudentAnswer(studyInfo.mode)
  const [correctAnswer, setCorrectAnswer] = useState<string>('')
  const [exampleData, setExamples] = useState<IListeningActivity1Example[]>([])
  const [tryCount, setTryCount] = useState(0) // 시도 횟수
  const [incorrectCount, setIncorrectCount] = useState<number>(0) // 문제 틀린 횟수

  // 정 / 오답시 하단에 나오는 correct / incorrect
  const { bottomPopupState, changeBottomPopupState } = useBottomPopup()

  // audio
  const { playState, playAudio, stopAudio } = useStudyAudio()

  const isWorking = useRef(true)

  useEffect(() => {
    if (!isStepIntro && quizData) {
      timer.setup(quizData.QuizTime, true)

      playAudio(quizData.Quiz[quizNo - 1].Question.Sound)
      isWorking.current = false
    }
  }, [isStepIntro])

  // 데이터를 받아온 후
  useEffect(() => {
    if (quizData) {
      try {
        // 현재 퀴즈 번호
        const [currentQuizNo, tryCnt] = useCurrentQuizNo(
          studyInfo.mode,
          recordedData,
          quizData.QuizAnswerCount,
        )

        let correctedExample: (string | undefined)[] = []
        let tempExample: IListeningActivity1Example[] = []

        // 기존 기록과 대조하여 표시해주기
        correctedExample = recordedData.map((record) => {
          return quizData.Quiz.find(
            (quiz) => record.OX === '1' && record.QuizNo === quiz.QuizNo,
          )?.Question.Text
        })

        tempExample = quizData.Examples.slice(0, 5).map((example) => {
          return {
            ...example,
            IsCorrected: correctedExample.find((ce) => ce === example.Text)
              ? true
              : false,
          }
        })

        // 기존 기록과 대비하여 표시해주기 end
        setTryCount(tryCnt)
        setIncorrectCount(tryCnt)
        setCorrectAnswer(quizData.Quiz[currentQuizNo - 1].Question.Text)
        setStudentAnswers(recordedData, quizData.QuizAnswerCount) // 기존 데이터

        if (studyInfo.mode === 'staff') {
          setExamples(tempExample)
        } else {
          setExamples(shuffle(tempExample))
        }

        setQuizNo(currentQuizNo) // 현재 퀴즈 번호
      } catch (e) {
        console.error(e)
      }
    }
  }, [quizData])

  // quizNo가 바뀌면 문제가 바뀐 것으로 인식
  useEffect(() => {
    if (!isStepIntro && !isResultShow && quizData) {
      stopAudio()
      setCorrectAnswer(quizData.Quiz[quizNo - 1].Question.Text)
    }
  }, [quizNo])

  useEffect(() => {
    if (!isStepIntro && !isResultShow && quizData) {
      playAudio(quizData.Quiz[quizNo - 1].Question.Sound)

      timer.setup(quizData.QuizTime, true)
      isWorking.current = false
    }
  }, [correctAnswer])

  // 결과창 노출
  useEffect(() => {
    if (isResultShow) {
      timer.stop()
    }
  }, [isResultShow])

  // 로딩
  if (!quizData) return <>Loading...</>

  /**
   * 정답 체크
   * @param target 카드
   * @param selectedAnswer 유저가 고른 답안
   */
  const checkAnswer = async (
    target: EventTarget & HTMLDivElement,
    selectedAnswer: string,
  ) => {
    if (!isWorking.current) {
      stopAudio()
      isWorking.current = true

      const isCorrect = correctAnswer === selectedAnswer

      // 채점판 생성
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
        selectedAnswer: selectedAnswer,
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

        addStudentAnswer(answerData)

        if (!isCorrect) {
          setIncorrectCount(incorrectCount + 1)
        }

        setTryCount(tryCount + 1)

        afterCheckAnswer(target, isCorrect)
      }
    }
  }

  /**
   * 정답 체크 후
   * @param target
   * @param isCorrect
   */
  const afterCheckAnswer = (
    target: EventTarget & HTMLDivElement,
    isCorrect: boolean,
  ) => {
    changeBottomPopupState({
      isActive: true,
      isCorrect: isCorrect,
    })

    if (isCorrect) {
      animationManager.play(target, ['animate__fadeIn'])
    } else {
      animationManager.play(target, ['animate__headShake'])
    }
  }

  /**
   * [ 카드 애니메이션 완료 후 실행되는 함수 ]
   * @param e target div
   * @param word word div
   */
  const onCardAnimationEndHandler = (
    e: React.AnimationEvent<HTMLDivElement>,
    appearWord: () => void,
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const target = e.currentTarget

    // 정 / 오답 확인
    const isCorrect = animationManager.isContain(target, 'animate__fadeIn')
      ? true
      : false

    setTimeout(() => {
      if (isCorrect) {
        appearWord()
      } else {
        animationManager.remove(target, ['animate__headShake'])

        changeBottomPopupState({
          isActive: false,
          isCorrect: false,
        })

        if (tryCount >= quizData.QuizAnswerCount) {
          setTryCount(0)
          setIncorrectCount(0)

          if (quizNo + 1 > quizData.Quiz.length) {
            changeResultShow(true)
          } else {
            setQuizNo(quizNo + 1)
          }
        } else {
          playWord()
          isWorking.current = false
        }
      }
    }, 1500)
  }

  /**
   * [ 카드에서 글자가 나타난 후 실행되는 함수 ]
   * @param e div
   * @param isCorrected 기존에 풀었던 문제인지
   */
  const onWordAnimationEndHandler = (
    e: React.AnimationEvent<HTMLDivElement>,
    isCorrected: boolean | undefined,
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const target = e.currentTarget

    animationManager.remove(target, ['selected'])

    changeBottomPopupState({
      isActive: false,
      isCorrect: false,
    })

    if (
      !isCorrected ||
      isCorrected === undefined ||
      studyInfo.mode === 'review'
    ) {
      setTimeout(() => {
        setTryCount(0)
        setIncorrectCount(0)

        if (quizNo + 1 > quizData.Quiz.length) {
          changeResultShow(true)
        } else {
          setQuizNo(quizNo + 1)
        }
      }, 1000)
    }
  }

  const playWord = () => {
    if (playState === '') {
      playAudio(quizData.Quiz[quizNo - 1].Question.Sound)
    } else {
      stopAudio()
    }
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
            comment={t('study.소리를 듣고 알맞은 그림을 고르세요.')}
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
                <BtnPlayWord playState={playState} onPlay={playWord} />

                {isMobile ? <Gap height={10} /> : <Gap height={15} />}

                <Container
                  typeCSS={style.listeningActivity1}
                  containerCSS={style.container}
                >
                  {exampleData.map((example) => {
                    return (
                      <CardWord
                        imgSrc={example.Image}
                        text={example.Text}
                        correctText={correctAnswer}
                        isCorrected={example.IsCorrected}
                        onCardAnimationEndHandler={onCardAnimationEndHandler}
                        onWordAnimationEndHandler={onWordAnimationEndHandler}
                        checkAnswer={checkAnswer}
                      />
                    )
                  })}
                </Container>

                <Gap height={15} />
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
