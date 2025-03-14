import { useEffect, useRef, useState, useContext } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useTranslation } from 'react-i18next'
import { getVocabularyTest1 } from '@services/quiz/VocabularyAPI'

import vocabularyCSS from '@stylesheets/vocabulary-test.module.scss'
import vocabularyCSSMobile from '@stylesheets/mobile/vocabulary-test.module.scss'

// Types [
import {
  IStudyData,
  IScoreBoardData as IScoreBoard,
  IUserAnswer,
} from '@interfaces/Common'
import { IVocabulary1Example } from '@interfaces/IVocabulary'
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
import Container from '@components/study/common-study/Container'
import StudyPopupBottom from '@components/study/common-study/StudyPopupBottom'
import TestResult from '@components/study/common-study/TestResult'

// components - vocalbulary test 1
import QuestionBox from '@components/study/vocabulary-test-01/QuestionBox'
import WrapperExample from '@components/study/vocabulary-test-01/WrapperExample'

const STEP_TYPE = 'Vocabulary Test'

const style = isMobile ? vocabularyCSSMobile : vocabularyCSS

export default function VocabularyTest1(props: IStudyData) {
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
      checkAnswer(undefined)
    } else {
      window.onLogoutStudy()
    }
  })

  // 애니메이션 hook
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
  const isWorking = useRef(false)
  // 퀴즈 데이터 / 저장된 데이터
  const [quizData, recordedData] = useFetch(getVocabularyTest1, props, STEP)
  const [quizNo, setQuizNo] = useState<number>(1) // 퀴즈 번호
  const {
    scoreBoardData,
    setStudentAnswers,
    addStudentAnswer,
    makeUserAnswerData,
  } = useStudentAnswer(studyInfo.mode)
  const [exampleData, setExamples] = useState<IVocabulary1Example[]>([]) // 과거 기록
  const [tryCount, setTryCount] = useState(0) // 시도 횟수
  const [incorrectCount, setIncorrectCount] = useState<number>(0) // 문제 틀린 횟수

  // 정 / 오답시 하단에 나오는 correct / incorrect
  const { bottomPopupState, changeBottomPopupState } = useBottomPopup()

  // audio
  const { playAudio } = useStudyAudio()

  // 좌 -> 우 이미지 및 예제 나타나는 애니메이션을 위해서
  const wrapperImgRef = useRef<HTMLDivElement>(null)
  const wrapperExampleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isStepIntro && quizData) {
      timer.setup(quizData.QuizTime, true)

      if (wrapperImgRef.current && wrapperExampleRef.current) {
        timer.setup(quizData.QuizTime, true)

        animationManager.remove(wrapperImgRef.current, ['animate__fadeInRight'])
        animationManager.remove(wrapperExampleRef.current, [
          'animate__fadeInRight',
        ])
      }

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

      if (wrapperImgRef.current && wrapperExampleRef.current) {
        animationManager.play(wrapperImgRef.current, ['animate__fadeInRight'])
        animationManager.play(wrapperExampleRef.current, [
          'animate__fadeInRight',
        ])
      }

      setTryCount(0)
      setIncorrectCount(0)

      if (studyInfo.mode === 'staff') {
        setExamples(quizData.Quiz[quizNo - 1].Examples)
      } else {
        setExamples(shuffle(quizData.Quiz[quizNo - 1].Examples))
      }

      setTimeout(() => {
        if (wrapperImgRef.current && wrapperExampleRef.current) {
          timer.setup(quizData.QuizTime, true)

          animationManager.remove(wrapperImgRef.current, [
            'animate__fadeInRight',
          ])
          animationManager.remove(wrapperExampleRef.current, [
            'animate__fadeInRight',
          ])
        }

        isWorking.current = false
      }, 1000)
    }
  }, [quizNo])

  // 로딩
  if (!quizData) return <>Loading...</>

  // 정답 체크
  const checkAnswer = async (
    target: (EventTarget & HTMLDivElement) | undefined = undefined,
    selectedAnswer: string = 'quiz time over',
  ) => {
    try {
      if (!isWorking.current) {
        isWorking.current = true

        const isCorrect =
          quizData.Quiz[quizNo - 1].Question.Text === selectedAnswer
            ? true
            : false

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

          afterCheckAnswer(target, isCorrect, tryCount + 1)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  // 답변 체크 후
  const afterCheckAnswer = (
    target: (EventTarget & HTMLDivElement) | undefined,
    isCorrect: boolean,
    tryCount: number,
  ) => {
    timer.stop()

    changeBottomPopupState({
      isActive: true,
      isCorrect: isCorrect,
    })

    // targe이 존재하지 않는 경우는 유저의 시간 초과로 판단
    if (target) {
      if (isCorrect) {
        animationManager.play(target, ['animate__fadeIn', style.correct])
      } else {
        animationManager.play(target, ['animate__headShake', style.incorrect])
      }
    } else {
      afterCheckAnswerOnTimeOut(tryCount)
    }
  }

  // 애니메이션 완료 후
  const onAnimationEndHandler = (e: React.AnimationEvent<HTMLDivElement>) => {
    const target = e.currentTarget

    setTimeout(() => {
      changeBottomPopupState({
        isActive: false,
        isCorrect: false,
      })

      // 정 / 오답 확인
      const isCorrect = animationManager.isContain(target, 'animate__fadeIn')
        ? true
        : false

      if (isCorrect) {
        const cbCorrect = () => {
          animationManager.remove(target, ['animate__fadeIn', style.correct])

          if (quizNo + 1 > quizData.Quiz.length) {
            // 정답 후 다음 문제가 없는 경우
            changeResultShow(true)
          } else {
            // 정답 후 다음 퀴즈로
            setQuizNo(quizNo + 1)
          }
        }

        playAudio(quizData.Quiz[quizNo - 1].Question.Sound, cbCorrect)
      } else {
        if (tryCount >= quizData.QuizAnswerCount) {
          if (quizNo + 1 > quizData.Quiz.length) {
            // 틀리고 다음 문제가 없는 경우
            const cbIncorrectAfterNoNextQuiz = () => {
              animationManager.remove(target, [
                'animate__headShake',
                style.incorrect,
              ])

              changeResultShow(true)
            }

            playAudio(
              quizData.Quiz[quizNo - 1].Question.Sound,
              cbIncorrectAfterNoNextQuiz,
            )
          } else {
            // 틀린 후 다음 퀴즈로 넘어가기 전
            const cbIncorrectAfterNextQuiz = () => {
              animationManager.remove(target, [
                'animate__headShake',
                style.incorrect,
              ])

              setQuizNo(quizNo + 1)
            }

            // add play audio
            playAudio(
              quizData.Quiz[quizNo - 1].Question.Sound,
              cbIncorrectAfterNextQuiz,
            )
          }
        } else {
          // 틀린 경우
          animationManager.remove(target, [
            'animate__headShake',
            style.incorrect,
          ])

          timer.setup(quizData.QuizTime, true)

          isWorking.current = false
        }
      }
    }, 1500)
  }

  // 제한 시간 내에 퀴즈를 풀지 않은 경우
  const afterCheckAnswerOnTimeOut = (tryCount: number) => {
    setTimeout(() => {
      changeBottomPopupState({
        isActive: false,
        isCorrect: false,
      })

      if (tryCount >= quizData.QuizAnswerCount) {
        if (quizNo + 1 > quizData.Quiz.length) {
          // 틀리고 다음 문제가 없는 경우
          const cbShowResult = () => {
            changeResultShow(true)
          }

          playAudio(quizData.Quiz[quizNo - 1].Question.Sound, cbShowResult)
        } else {
          // 틀린 후 다음 퀴즈로 넘어가기 전
          const cbBeforeNextQuiz = () => {
            setQuizNo(quizNo + 1)
          }

          playAudio(quizData.Quiz[quizNo - 1].Question.Sound, cbBeforeNextQuiz)
        }
      } else {
        // 틀린 경우
        timer.setup(quizData.QuizTime, true)
        isWorking.current = false
      }
    }, 1000)
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
            comment={t('study.그림을 보고 알맞은 단어를 고르세요.')}
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
                  typeCSS={style.vocabularyTest1}
                  containerCSS={style.container}
                >
                  <QuestionBox img={quizData.Quiz[quizNo - 1].Question.Image} />

                  <Gap height={20} />

                  <WrapperExample
                    exampleData={exampleData}
                    correctText={quizData.Quiz[quizNo - 1].Question.Text}
                    checkAnswer={checkAnswer}
                    onAnimationEndHandler={onAnimationEndHandler}
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
