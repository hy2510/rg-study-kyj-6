import { useEffect, useRef, useState, useContext } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useTranslation } from 'react-i18next'
import { saveUserAnswer } from '@services/studyApi'

import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

// Types [
import {
  IStudyData,
  IScoreBoardData as IScoreBoard,
  IUserAnswer,
} from '@interfaces/Common'
import { getWritingActivity1 } from '@services/quiz/WritingActivityAPI'
import { IWritingActivity1Example } from '@interfaces/IWritingActivity'
export type SentenceState = '' | 'correct' | 'incorrect'
// ] Types

// utils
import { shuffle } from 'lodash'
import useStepIntro from '@hooks/common/useStepIntro'
import { useQuizTimer } from '@hooks/study/useQuizTimer'
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
import Gap from '@components/study/common-study/Gap'
import Container from '@components/study/common-study/Container'
import StudyPopupBottom from '@components/study/common-study/StudyPopupBottom'
import TestResult from '@components/study/common-study/TestResult'

// components - writing activity 1
import BtnPlayWord from '@components/study/writing-activity-01/BtnPlayWord'
import ArrowUp from '@components/study/writing-activity-01/ArrowUp'
import WrapperExample from '@components/study/writing-activity-01/WrapperExample'
import WrapperSentenceBox from '@components/study/writing-activity-01/WrapperSentenceBox'
import BtnGoNext from '@components/study/writing-activity-01/BtnGoNext'

const STEP_TYPE = 'Writing Activity'

const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

export default function WrtingActivity1(props: IStudyData) {
  const { t } = useTranslation()
  const { bookInfo, handler, studyInfo } = useContext(
    AppContext,
  ) as AppContextProps
  const STEP = props.currentStep

  const timer = useQuizTimer(() => {
    // timer가 0에 도달하면 호출되는 콜백함수 구현
    window.onLogoutStudy()
  })

  // 인트로
  const [introAnim, setIntroAnim] = useState<
    'animate__bounceInRight' | 'animate__bounceOutLeft'
  >('animate__bounceInRight')
  const { isStepIntro, closeStepIntro } = useStepIntro()
  const { isResultShow, changeResultShow } = useResult()

  // 사이드 메뉴
  const [isSideOpen, setSideOpen] = useState(false)

  // 퀴즈 데이터 세팅
  const isWorking = useRef(true)
  const [quizData, recordedData] = useFetch(getWritingActivity1, props, STEP)
  const [quizNo, setQuizNo] = useState<number>(1) // 퀴즈 번호

  // 과거 기록
  const {
    scoreBoardData,
    setStudentAnswers,
    addStudentAnswer,
    makeUserAnswerData,
  } = useStudentAnswer(studyInfo.mode)
  const [tryCount, setTryCount] = useState(0) // 시도 횟수
  const [incorrectCount, setIncorrectCount] = useState<number>(0) // 문제 틀린 횟수

  // 문장
  const [sentenceState, setSentenceState] = useState<SentenceState>('')

  // 예제
  const exampleRefs = useRef<HTMLDivElement[]>([])
  const [exampleData, setExamples] = useState<IWritingActivity1Example[]>([])
  const [sentenceData, setSentence] = useState<
    { text: string; index: number }[]
  >([])

  // 정 / 오답시 하단에 나오는 correct / incorrect
  const { bottomPopupState, changeBottomPopupState } = useBottomPopup()

  const [isBtnNext, setBtnNext] = useState(false)

  // audio
  const { playState, playAudio, stopAudio } = useStudyAudio()

  useEffect(() => {
    if (!isStepIntro && quizData) {
      timer.setup(quizData.QuizTime, true)

      if (bookInfo.BookLevel.includes('K')) {
        playAudio(quizData.Quiz[quizNo - 1].Question.Sound)
      }

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

        setTryCount(tryCnt)
        setIncorrectCount(tryCnt)

        if (studyInfo.mode === 'student') {
          setExamples(shuffle(quizData.Quiz[currentQuizNo - 1].Examples))
        } else if (studyInfo.mode === 'review') {
          if (Number(bookInfo.Average) >= 70) {
            setExamples(quizData.Quiz[currentQuizNo - 1].Examples)
          } else {
            setExamples(shuffle(quizData.Quiz[currentQuizNo - 1].Examples))
          }
        } else {
          setExamples(quizData.Quiz[currentQuizNo - 1].Examples)
        }

        setStudentAnswers(recordedData, quizData.QuizAnswerCount) // 기존 데이터를 채점판에 넣어주기
        setQuizNo(currentQuizNo) // 현재 퀴즈 번호
      } catch (e) {
        console.error(e)
      }
    }
  }, [quizData])

  // sentence가 다 채워진 경우 정답 체크
  useEffect(() => {
    if (quizData && sentenceState === '') {
      if (sentenceData.length === quizData.Quiz[quizNo - 1].Examples.length) {
        checkAnswer()
      }
    }
  }, [sentenceData])

  // quizNo가 바뀌면 문제가 바뀐 것으로 인식
  useEffect(() => {
    if (!isStepIntro && !isResultShow && quizData) {
      if (studyInfo.mode === 'student') {
        setExamples(shuffle(quizData.Quiz[quizNo - 1].Examples))
      } else if (studyInfo.mode === 'review') {
        if (Number(bookInfo.Average) >= 70) {
          setExamples(quizData.Quiz[quizNo - 1].Examples)
        } else {
          setExamples(shuffle(quizData.Quiz[quizNo - 1].Examples))
        }
      } else {
        setExamples(quizData.Quiz[quizNo - 1].Examples)
      }

      setIncorrectCount(0)
      setTryCount(0)
      setSentenceState('')

      resetSentence()

      if (bookInfo.BookLevel.includes('K')) {
        playAudio(quizData.Quiz[quizNo - 1].Question.Sound)
      }

      isWorking.current = false
    }
  }, [quizNo])

  useEffect(() => {
    if (isBtnNext && quizData && isWorking.current) {
      stopAudio()
    }
  }, [isBtnNext])

  // 로딩
  if (!quizData) return <>Loading...</>

  /** [ 하단 단어 선택할 경우 위로 올리기 ]
   * @index 하단에 선택한 단어 번호
   * @selectedWord 선택한 단어
   */
  const selectWord = (index: number, selectedWord: string) => {
    exampleRefs.current[index].classList.add(style.send)

    const newSentence = [...sentenceData, { text: selectedWord, index: index }]

    setSentence(newSentence)
  }

  /** [ sentence 부분 클릭해서 없애기 ]
   * @param word 클릭한 단어
   */
  const removeWord = (word: string, wordIndex: number) => {
    if (!isWorking.current) {
      const newSentence = sentenceData.filter(
        (sen: { text: string; index: number }) => {
          return sen.index !== wordIndex
        },
      )

      exampleRefs.current[wordIndex].classList.remove(style.send)

      setSentence(newSentence)
    }
  }

  // sentence 초기화
  const resetSentence = () => {
    try {
      if (exampleRefs.current) {
        exampleRefs.current.map((exampleRefs) =>
          exampleRefs.classList.remove(style.send),
        )
      }
    } catch (e) {
    } finally {
      setSentence([])
    }
  }

  // 정답 체크
  const checkAnswer = async () => {
    try {
      if (!isWorking.current) {
        isWorking.current = true
        timer.stop()
        stopAudio()

        const question = quizData.Quiz[quizNo - 1].Question.Text
        const makedSentence = sentenceData
          .reduce((acc, obj) => {
            const text = obj.text

            return acc + (' ' + text)
          }, '')
          .trimStart()
        const isCorrect = question === makedSentence
        let incorrectCnt = incorrectCount

        // 채점판 생성
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
          selectedAnswer: makedSentence,
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

          if (!isCorrect) {
            setIncorrectCount(incorrectCount + 1)
          }

          addStudentAnswer(answerData)

          setTryCount(tryCount + 1)

          afterCheckAnswer(isCorrect, incorrectCnt + 1)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const afterCheckAnswer = (isCorrect: boolean, incorrectCnt: number) => {
    setSentenceState(isCorrect ? 'correct' : 'incorrect')
    changeBottomPopupState({
      isActive: true,
      isCorrect: isCorrect,
    })

    setTimeout(() => {
      changeBottomPopupState({
        isActive: false,
        isCorrect: false,
      })

      if (isCorrect) {
        // 정답인 경우
        if (bookInfo.BookLevel.includes('K')) {
          beforeNextQuiz()
        } else {
          const cbAfterPlayAudio = () => {
            setBtnNext(true)
          }

          playAudio(quizData.Quiz[quizNo - 1].Question.Sound, cbAfterPlayAudio)
        }
      } else {
        if (incorrectCnt >= quizData.QuizAnswerCount) {
          // 오답인데 기회를 모두 소모한 경우
          const correctSentence = quizData.Quiz[quizNo - 1].Examples.map(
            (example, i) => {
              return { text: example.Text, index: i }
            },
          )

          setSentence([...correctSentence])

          if (bookInfo.BookLevel.includes('K')) {
            beforeNextQuiz()
          } else {
            const cbAfterPlayAudio = () => {
              setBtnNext(true)
            }

            playAudio(
              quizData.Quiz[quizNo - 1].Question.Sound,
              cbAfterPlayAudio,
            )
          }
        } else {
          // 오답이지만 기회가 남아있는 경우
          timer.setup(quizData.QuizTime, true)
          setSentenceState('')

          resetSentence()

          if (bookInfo.BookLevel.includes('K')) {
            playAudio(quizData.Quiz[quizNo - 1].Question.Sound)
          }

          isWorking.current = false
        }
      }
    }, 2000)
  }

  // 다음 퀴즈로 넘어가기 전
  const beforeNextQuiz = () => {
    stopAudio()

    const cbBeforNextQuiz = () => {
      resetSentence()
      setSentenceState('')

      if (quizNo + 1 > quizData.Quiz.length) {
        changeResultShow(true)
      } else {
        if (bookInfo.BookLevel.includes('K')) {
          timer.setup(quizData.QuizTime, true)
          stopAudio()
          setQuizNo(quizNo + 1)
        } else {
          const cbAfterPlayAudio = () => {
            setBtnNext(true)
          }

          playAudio(quizData.Quiz[quizNo - 1].Question.Sound, cbAfterPlayAudio)
        }
      }
    }

    playAudio(quizData.Quiz[quizNo - 1].Question.Sound, cbBeforNextQuiz)
  }

  const goNextQuiz = () => {
    if (quizNo + 1 > quizData.Quiz.length) {
      stopAudio()
      timer.stop()

      changeResultShow(true)
    } else {
      timer.setup(quizData.QuizTime, true)
      stopAudio()
      setQuizNo(quizNo + 1)
      setBtnNext(false)
    }
  }

  /**
   * 헤더 메뉴 클릭하는 기능
   */
  const changeSideMenu = (state: boolean) => {
    setSideOpen(state)
  }

  const playSentence = () => {
    if (playState === '') {
      playAudio(quizData.Quiz[quizNo - 1].Question.Sound)
    } else {
      if (!isWorking.current) {
        stopAudio()
      }
    }
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
            comment={t(
              'study.카드를 순서대로 나열하여 올바른 문장을 완성하세요.',
            )}
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
                <BtnPlayWord playState={playState} onPlay={playSentence} />

                <Gap height={15} />

                <Container
                  typeCSS={style.writingActivity1}
                  containerCSS={style.container}
                >
                  {/* 위쪽 문장칸 */}
                  <WrapperSentenceBox
                    sentenceState={sentenceState}
                    sentenceData={sentenceData}
                    removeWord={removeWord}
                  />

                  <>
                    {/* K레벨이 아닌 경우에는 버튼을 클릭해서 다음 문제로 넘어감 */}
                    {!isBtnNext ? (
                      <>
                        {/* 화살표 */}
                        <ArrowUp />

                        {/* 하단 카드칸 */}
                        <WrapperExample
                          exampleRefs={exampleRefs}
                          exampleData={exampleData}
                          selectWord={selectWord}
                        />
                      </>
                    ) : (
                      <BtnGoNext goNextQuiz={goNextQuiz} />
                    )}
                  </>
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
