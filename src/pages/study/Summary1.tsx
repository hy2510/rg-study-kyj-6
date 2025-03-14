import { useContext, useEffect, useRef, useState } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useTranslation } from 'react-i18next'

import { deletePenalty, saveUserAnswer } from '@services/studyApi'
import { getSummary1, getSummaryHint } from '@services/quiz/SummaryApi'

import summaryCSS from '@stylesheets/summary.module.scss'
import summaryCSSMobile from '@stylesheets/mobile/summary.module.scss'

// Types [
import { IStudyData, IScoreBoardData, IUserAnswer } from '@interfaces/Common'
import { IHint } from '@interfaces/IVocabulary'
import { ISummary1Hint, ISummary1Quiz } from '@interfaces/ISummary'
export type MultiPlayStateProps = {
  playState: PlayState
  playType: '' | 'sentence' | 'all'
  seq: number
}
export type PenaltyState = 'none' | 'penalty' | 'success'
// ] Types

// utils & hooks
import { shuffle } from 'lodash'
import useStepIntro from '@hooks/common/useStepIntro'
import { useQuizTimer } from '@hooks/study/useQuizTimer'
import { useAnimation } from '@hooks/study/useAnimation'
import { useFetch } from '@hooks/study/useFetch'
import { useCurrentQuizNo } from '@hooks/study/useCurrentQuizNo'
import { useStudentAnswer } from '@hooks/study/useStudentAnswer'
import useStudyAudio, { PlayState } from '@hooks/study/useStudyAudio'
import { useExample } from '@hooks/study/useExample'
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

// components - summary 1
import WrapperSentenceTop from '@components/study/summary-01/WrapperSentenceTop'
import ArrowUp from '@components/study/summary-01/ArrowUp'
import WrapperSentenceBottom from '@components/study/summary-01/WrapperSentenceBottom'
import BtnHint from '@components/study/summary-01/BtnHint'
import BtnPlayAll from '@components/study/summary-01/BtnPlayAll'
import BtnNext from '@components/study/summary-01/BtnNext'
import WrapperPenalty from '@components/study/summary-01/WrapperPenalty'

const STEP_TYPE = 'Summary Test'

const style = isMobile ? summaryCSSMobile : summaryCSS

export default function Summary1(props: IStudyData) {
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
      // 2a 이상은 incorrect 그 외에는 로그아웃
      if (bookInfo.BookCode.includes('EB')) {
        if (
          bookInfo.BookLevel.includes('1') ||
          bookInfo.BookLevel.includes('K')
        ) {
          // do logout
          window.onLogoutStudy()
        } else {
          // incorrect
          checkAnswerTimeOut()
        }
      } else if (bookInfo.BookCode.includes('PB')) {
        checkAnswerTimeOut()
      }
    } else {
      window.onLogoutStudy()
    }
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

  // 퀴즈 데이터
  const isWorking = useRef(true)
  const [quizData, recordedData] = useFetch(getSummary1, props, STEP) // 퀴즈 데이터 / 저장된 데이터
  const [quizNo, setQuizNo] = useState<number>(1) // 퀴즈 번호
  const [tryCount, setTryCount] = useState(0) // 시도 횟수
  const [incorrectCount, setIncorrectCount] = useState<number>(0) // 문제 틀린 횟수
  const [penaltyData, setPenalty] = useState<{
    penaltyState: PenaltyState
    sentence: string
  }>({
    penaltyState: 'none',
    sentence: '',
  })

  // 정 / 오답시 하단에 나오는 correct / incorrect
  const { bottomPopupState, changeBottomPopupState } = useBottomPopup()

  // 과거 기록
  const {
    scoreBoardData,
    setStudentAnswers,
    setStudentAnswersSummary1ReviewFail,
    addStudentAnswer,
    makeUserAnswerData,
    convertRecordToScoreBoard,
  } = useStudentAnswer(studyInfo.mode)

  // 예제 데이터
  const { exampleManager } = useExample()
  const [exampleData, setExampleData] = useState<ISummary1Quiz[]>([])
  const [selectedData, setSelectedData] = useState<IScoreBoardData[]>([]) // 정 / 오답 기록된 문장들

  // audio
  const { playAudio, stopAudio } = useStudyAudio()
  // 음원이 여러 개인 경우를 위해서
  const [multiPlayState, setMultiPlayState] = useState<MultiPlayStateProps>({
    playState: '',
    seq: -1,
    playType: '',
  })

  // 힌트
  const [hint, setHint] = useState<ISummary1Hint>({
    IsEnabled: false,
    Max: 0,
    Try: 0,
  })
  const [clearHint, setClearHint] = useState(false)

  // 스텝 완료 후 next 버튼
  const [isStepEnd, setIsStepEnd] = useState(false)

  // 인트로
  useEffect(() => {
    if (!isStepIntro && quizData) {
      if (studyInfo.mode === 'review' && Number(bookInfo.Average) >= 70) {
        setIsStepEnd(true)
      } else {
        if (penaltyData.penaltyState === 'none') {
          if (!isStepEnd) timer.setup(quizData.QuizTime, true)
        }

        isWorking.current = false
      }
    }
  }, [isStepIntro])

  // 데이터를 받아온 후
  useEffect(() => {
    if (quizData) {
      // 현재 퀴즈 번호
      const [currentQuizNo, tryCnt] = useCurrentQuizNo(
        studyInfo.mode,
        recordedData,
        quizData.QuizAnswerCount,
      )
      // 예제
      const examples: ISummary1Quiz[] = exampleManager.getExamplesByQuizNo(
        quizData.Quiz,
        currentQuizNo,
        props.mode,
      )

      if (studyInfo.mode === 'review') {
        if (Number(bookInfo.Average) < 70) {
          // fail한 리뷰인 경우
          setExampleData(shuffle(examples))
        } else {
          // pass한 리뷰인 경우
          setStudentAnswers(recordedData, quizData.QuizAnswerCount) // 기존 데이터를 채점판에 넣어주기
          setSelectedData(
            convertRecordToScoreBoard(recordedData, quizData.QuizAnswerCount),
          )
        }
      } else {
        if (studyInfo.mode === 'student') {
          setSelectedData(
            convertRecordToScoreBoard(recordedData, quizData.QuizAnswerCount),
          )
          setStudentAnswers(recordedData, quizData.QuizAnswerCount) // 기존 데이터를 채점판에 넣어주기
        }

        setExampleData(examples)
      }

      // 힌트 유무
      if (quizData.Hint.IsEnabled) {
        if (studyInfo.mode === 'student') {
          setHint({
            IsEnabled: quizData.Hint.IsEnabled,
            Max: quizData.Hint.Max,
            Try: quizData.Hint.Try,
          })
        } else {
          setHint({
            IsEnabled: quizData.Hint.IsEnabled,
            Max: quizData.Hint.Max,
            Try: 0,
          })
        }
      }

      if (recordedData.length > 0 && studyInfo.mode === 'student') {
        if (
          quizData.IsEnablePenaltyReview &&
          recordedData[recordedData.length - 1].PenaltyWord !== ''
        ) {
          // 기존에 패널티를 안하고 넘어간 경우
          setPenalty({
            penaltyState: 'penalty',
            sentence: recordedData[recordedData.length - 1].PenaltyWord,
          })
          setQuizNo(currentQuizNo - 1)
        } else {
          if (currentQuizNo > quizData.Quiz.length) {
            setIsStepEnd(true)
            setQuizNo(quizData.Quiz.length)
          } else {
            setQuizNo(currentQuizNo)
          }
        }
        setTryCount(tryCnt)
        setIncorrectCount(tryCnt)
      } else {
        setTryCount(tryCnt)
        setIncorrectCount(tryCnt)
        setQuizNo(currentQuizNo)
      }
    }
  }, [quizData])

  // 오디오 재생 및 중지
  useEffect(() => {
    stopAudio()

    if (quizData) {
      if (multiPlayState.seq > -1) {
        if (multiPlayState.playType === 'sentence') {
          const cbAfterPlaySentence = () => {
            setMultiPlayState({
              playState: '',
              playType: '',
              seq: -1,
            })
          }

          playAudio(
            quizData.Quiz[multiPlayState.seq].Question.Sound,
            cbAfterPlaySentence,
          )
        } else if (multiPlayState.playType === 'all') {
          const cbPlayNextSentence = () => {
            if (multiPlayState.seq < quizData.Quiz.length - 1) {
              setMultiPlayState({
                playState: 'playing',
                playType: 'all',
                seq: multiPlayState.seq + 1,
              })
            } else {
              stopAudio()

              setMultiPlayState({
                playState: '',
                playType: '',
                seq: -1,
              })
            }
          }

          playAudio(
            quizData.Quiz[multiPlayState.seq].Question.Sound,
            cbPlayNextSentence,
          )
        }
      }
    }
  }, [multiPlayState])

  // quizNo 바뀌면 문제를 푼 것으로 인식
  useEffect(() => {
    if (!isStepIntro && !isResultShow && quizData) {
      setTryCount(0)
      setIncorrectCount(0)

      playSentence(quizNo - 2)

      if (penaltyData.penaltyState === 'none') {
        timer.setup(quizData.QuizTime, true)
      }

      isWorking.current = false
    }
  }, [quizNo])

  // 힌트를 완료하면
  useEffect(() => {
    if (clearHint) {
      afterHint()
    }
  }, [clearHint])

  // 패널티
  useEffect(() => {
    if (penaltyData.penaltyState === 'penalty' && quizData) {
      timer.stop()
    }
  }, [penaltyData])

  // 로딩
  if (!quizData) return <>Loading...</>

  /**
   * [ 정/오답 체크 ]
   * @param target 유저가 선택한 답안
   */
  const checkAnswer = async (
    target: EventTarget & HTMLDivElement,
    selectedAnswer: string,
  ) => {
    try {
      if (!isWorking.current) {
        isWorking.current = true

        setMultiPlayState({
          playState: '',
          playType: '',
          seq: -1,
        })

        const replaceHTMLReg = /<[^>]*>/gi
        const isCorrect =
          quizData.Quiz[quizNo - 1].Question.Text === selectedAnswer

        // 채점판 만들기
        const answerData: IScoreBoardData = {
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
          correct: quizData.Quiz[quizNo - 1].Question.Text.replace(
            replaceHTMLReg,
            '',
          ),
          selectedAnswer: selectedAnswer.replace(replaceHTMLReg, ''),
          tryCount: tryCount + 1,
          maxQuizCount: quizData.QuizAnswerCount,
          quizLength: quizData.Quiz.length,
          isCorrect: isCorrect,
          answerData: answerData,
          isEnabledPenalty: quizData.IsEnablePenaltyReview,
          isFinishStudy: props.lastStep === STEP ? true : false,
        })

        // 서버에 유저 답안 전송
        timer.stop()

        const res = await saveUserAnswer(studyInfo.mode, userAnswer)

        if (Number(res.result) === 0) {
          if (res.resultMessage) {
            handler.finishStudy = {
              id: Number(res.result),
              cause: res.resultMessage,
            }

            const finishStudyInfo = {
              id: Number(res.result),
              cause: res.resultMessage,
            }

            window.sessionStorage.setItem(
              'finishStudyInfo',
              JSON.stringify(finishStudyInfo),
            )
          }

          const isFail =
            studyInfo.mode === 'review' && Number(bookInfo.Average) < 70

          addStudentAnswer(answerData, isFail)

          if (!isCorrect) {
            setIncorrectCount(incorrectCount + 1)
          }

          setTryCount(tryCount + 1)

          afterCheckAnswer(target, isCorrect)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * 접당 체 후 실행되는 함수
   * @param target 애니메이션이 일어날 보기
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
      // 정답
      if (target) {
        animationManager.play(target, ['animate__fadeIn', style.correct])
      }
    } else {
      // 오답
      animationManager.play(target, ['animate__headShake', style.incorrect])
    }
  }

  /**
   * 애니메이션이 끝난 후에
   * @param target
   */
  const onAnimationEnd = (target: EventTarget & HTMLDivElement) => {
    // 정 / 오답 확인
    const isCorrect = animationManager.isContain(target, 'animate__fadeIn')
      ? true
      : false

    setTimeout(() => {
      animationManager.remove(target, [
        'animate__fadeIn',
        'animate__headShake',
        style.correct,
        style.incorrect,
      ])

      changeBottomPopupState({
        isActive: false,
        isCorrect: false,
      })

      // 정 / 오답에 따른 분기처리
      if (isCorrect) {
        const newExample = exampleData.filter(
          (example) => example.QuizNo !== quizNo,
        )

        setExampleData([...newExample])
        setSelectedData(scoreBoardData)

        setTimeout(() => {
          if (quizNo + 1 > quizData.Quiz.length) {
            playSentence(quizNo - 1)
            changeStepEnd(true)
          } else {
            setQuizNo(quizNo + 1)
          }
        }, 300)
      } else {
        if (tryCount >= quizData.QuizAnswerCount) {
          const newExample = exampleData.filter(
            (example) => example.QuizNo !== quizNo,
          )

          setExampleData([...newExample])
          setSelectedData(scoreBoardData)

          if (quizNo + 1 > quizData.Quiz.length) {
            if (quizData.IsEnablePenaltyReview) {
              setPenalty({
                penaltyState: 'penalty',
                sentence: quizData.Quiz[quizNo - 1].Question.Text,
              })
            } else {
              playSentence(quizNo - 1)
              changeStepEnd(true)
            }
          } else {
            if (quizData.IsEnablePenaltyReview) {
              setPenalty({
                penaltyState: 'penalty',
                sentence: quizData.Quiz[quizNo - 1].Question.Text,
              })
            } else {
              setTimeout(() => {
                setQuizNo(quizNo + 1)
              }, 100)
            }
          }
        } else {
          timer.setup(quizData.QuizTime, true)
          isWorking.current = false
        }
      }
    }, 1000)
  }

  /**
   * 시간 초과로 인한 오답 체크
   */
  const checkAnswerTimeOut = async () => {
    try {
      if (!isWorking.current) {
        isWorking.current = true

        setMultiPlayState({
          playState: '',
          playType: '',
          seq: -1,
        })

        // 채점판 만들기
        const answerData: IScoreBoardData = {
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
          correct: quizData.Quiz[quizNo - 1].Question.Text,
          selectedAnswer: '',
          tryCount: tryCount + 1,
          maxQuizCount: quizData.QuizAnswerCount,
          quizLength: quizData.Quiz.length,
          isCorrect: false,
          answerData: answerData,
          isEnabledPenalty: quizData.IsEnablePenaltyReview,
          isFinishStudy: props.lastStep === STEP ? true : false,
        })

        // 서버에 유저 답안 전송
        timer.stop()

        const res = await saveUserAnswer(studyInfo.mode, userAnswer)

        if (Number(res.result) === 0) {
          if (res.resultMessage) {
            handler.finishStudy = {
              id: Number(res.result),
              cause: res.resultMessage,
            }

            const finishStudyInfo = {
              id: Number(res.result),
              cause: res.resultMessage,
            }

            window.sessionStorage.setItem(
              'finishStudyInfo',
              JSON.stringify(finishStudyInfo),
            )
          }

          addStudentAnswer(answerData)
          setIncorrectCount(incorrectCount + 1)
          setTryCount(tryCount + 1)

          changeBottomPopupState({
            isActive: true,
            isCorrect: false,
          })

          setTimeout(() => {
            changeBottomPopupState({
              isActive: false,
              isCorrect: false,
            })

            if (tryCount + 1 >= quizData.QuizAnswerCount) {
              const newExample = exampleData.filter(
                (example) => example.QuizNo !== quizNo,
              )

              setExampleData(newExample)
              setSelectedData((scoreBoardData) => [
                ...scoreBoardData,
                answerData,
              ])

              if (quizNo + 1 > quizData.Quiz.length) {
                if (quizData.IsEnablePenaltyReview) {
                  setPenalty({
                    penaltyState: 'penalty',
                    sentence: quizData.Quiz[quizNo - 1].Question.Text,
                  })
                } else {
                  playSentence(quizNo - 1)
                  changeStepEnd(true)
                }
              } else {
                if (quizData.IsEnablePenaltyReview) {
                  setPenalty({
                    penaltyState: 'penalty',
                    sentence: quizData.Quiz[quizNo - 1].Question.Text,
                  })
                } else {
                  setQuizNo(quizNo + 1)
                }
              }
            } else {
              timer.setup(quizData.QuizTime, true)
              isWorking.current = false
            }
          }, 1000)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * 힌트 클릭
   * 힌트가 존재해야 하고, 남은 횟수가 존재해야 함
   */
  const clickHint = async () => {
    try {
      if (
        hint.IsEnabled &&
        hint &&
        hint.Try !== undefined &&
        hint.Max !== undefined &&
        hint.Max - hint.Try > 0
      ) {
        if (!isWorking.current) {
          isWorking.current = true

          setMultiPlayState({
            playState: '',
            playType: '',
            seq: -1,
          })
          timer.stop()

          // 서버에 유저 답안 전송
          let hintData: IHint = {
            Type: 0,
            Hint: '',
            TryHint: 0,
            ErrorNo: 0,
          }

          if (studyInfo.mode === 'student') {
            hintData = await getSummaryHint(
              props.studyId,
              props.studentHistoryId,
              quizNo,
              `${props.currentStep}`,
            )
          } else {
            hintData = {
              Type: 0,
              Hint: quizData.Quiz[quizNo - 1].Question.Text,
              TryHint: hint.Try + 1,
              ErrorNo: 0,
            }
          }

          if (hintData.ErrorNo === 0) {
            // 채점판 만들기
            setHint({
              IsEnabled: quizData.Hint.IsEnabled,
              Max: quizData.Hint.Max,
              Try: hintData.TryHint,
            })

            const answerData: IScoreBoardData = {
              quizNo: quizNo,
              maxCount: quizData.QuizAnswerCount,
              answerCount: tryCount + 1,
              ox: true,
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
              selectedAnswer: quizData.Quiz[quizNo - 1].Question.Text,
              tryCount: tryCount + 1,
              maxQuizCount: quizData.QuizAnswerCount,
              quizLength: quizData.Quiz.length,
              isCorrect: true,
              answerData: answerData,
              isEnabledPenalty: quizData.IsEnablePenaltyReview,
              isFinishStudy: props.lastStep === STEP ? true : false,
            })

            const res = await saveUserAnswer(studyInfo.mode, userAnswer)

            if (Number(res.result) === 0) {
              if (res.resultMessage) {
                handler.finishStudy = {
                  id: Number(res.result),
                  cause: res.resultMessage,
                }

                const finishStudyInfo = {
                  id: Number(res.result),
                  cause: res.resultMessage,
                }

                window.sessionStorage.setItem(
                  'finishStudyInfo',
                  JSON.stringify(finishStudyInfo),
                )
              }

              addStudentAnswer(answerData)
              setTryCount(tryCount + 1)

              setClearHint(true)
            }
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const afterHint = () => {
    const newExample = exampleData.filter(
      (example) => example.QuizNo !== quizNo,
    )

    setExampleData([...newExample])
    setSelectedData(scoreBoardData)

    if (quizNo + 1 > quizData.Quiz.length) {
      playSentence(quizNo - 1)
      changeStepEnd(true)
    } else {
      setQuizNo(quizNo + 1)
    }

    setClearHint(false)
  }

  const changeStepEnd = (state: boolean) => {
    timer.setup(0)
    setIsStepEnd(state)
  }

  /**
   * 헤더 메뉴 클릭하는 기능
   */
  const changeSideMenu = (state: boolean) => {
    setSideOpen(state)
  }

  /**
   * 문장 재생
   * @param index 문장 번호
   */
  const playSentence = (index: number) => {
    // 재생 중에 다른 보기의 스피커를 클릭한 경우 현재 재생중인 오디오를 중지 후 재생
    // 재생 중인 스피커를 다시 클릭한 경우 중지
    if (multiPlayState.playState === '' && index > -1) {
      // 모든 스피커가 재생중이 아닌 경우 - 그냥 재생
      setMultiPlayState({
        playState: 'playing',
        playType: 'sentence',
        seq: index,
      })
    } else if (
      multiPlayState.playState === 'playing' &&
      multiPlayState.seq === index
    ) {
      // 이미 재생중인 스피커를 클릭한 경우 - 중지
      setMultiPlayState({
        playState: '',
        playType: '',
        seq: -1,
      })
    } else if (
      multiPlayState.playState === 'playing' &&
      multiPlayState.seq !== index
    ) {
      // 이미 재생중인데 다른 스피커를 클릭한 경우 - 기존 스피커 중지 후 재생
      setMultiPlayState({
        playState: 'playing',
        playType: 'sentence',
        seq: index,
      })
    }
  }

  /**
   * 학습 완료 후 문장 전체 재생
   */
  const playAll = () => {
    if (multiPlayState.playState === 'playing') {
      setMultiPlayState({
        playState: '',
        playType: '',
        seq: -1,
      })
    } else {
      setMultiPlayState({
        playState: 'playing',
        playType: 'all',
        seq: 0,
      })
    }
  }

  /**
   * 다음 퀴즈로
   */
  const goNext = () => {
    setMultiPlayState({
      playState: '',
      playType: '',
      seq: -1,
    })

    changeResultShow(true)
  }

  /**
   * 패널티 상태 변경
   * @param state
   */
  const changePenaltyState = (state: PenaltyState) => {
    if (state === 'none') {
      afterPenalty()
    } else {
      setPenalty({
        penaltyState: state,
        sentence: quizData.Quiz[quizNo - 1].Question.Text,
      })
    }
  }

  /**
   * 패널티 완료 후
   */
  const afterPenalty = async () => {
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

          const finishStudyInfo = {
            id: Number(res.result),
            cause: res.resultMessage,
          }

          window.sessionStorage.setItem(
            'finishStudyInfo',
            JSON.stringify(finishStudyInfo),
          )
        }

        stopAudio()

        if (isLastQuiz) {
          // 마지막 문제 처리
          setPenalty({
            penaltyState: 'none',
            sentence: '',
          })
          playSentence(quizNo - 1)
          changeStepEnd(true)
        } else {
          setPenalty({
            penaltyState: 'none',
            sentence: '',
          })
          setQuizNo(quizNo + 1)
        }
      }
    }

    clearPenalty()
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
            comment={t('study.나열된 문장을 보고 올바른 순서대로 고르세요.')}
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
                {penaltyData.penaltyState === 'none' ? (
                  <Container
                    typeCSS={style.summaryTest1}
                    containerCSS={style.container}
                  >
                    {/* 스텝을 완료하면 재생 버튼 */}
                    <>
                      {isStepEnd && (
                        <BtnPlayAll
                          multiPlayState={multiPlayState}
                          playAll={playAll}
                        />
                      )}
                    </>

                    {/* 유저가 고른 문장들 */}
                    <WrapperSentenceTop
                      isStepEnd={isStepEnd}
                      multiPlayState={multiPlayState}
                      sentenceData={quizData.Quiz}
                      selectedData={selectedData}
                      playSentence={playSentence}
                    />

                    <>
                      {!isStepEnd ? (
                        <>
                          {/* 윗방향 화살표 */}
                          <ArrowUp />

                          {/* 유저가 골라야 하는 문장들 */}
                          <WrapperSentenceBottom
                            isWorking={isWorking.current}
                            exampleData={exampleData}
                            checkAnswer={checkAnswer}
                            onAnimationEnd={onAnimationEnd}
                          />

                          {hint.IsEnabled && (
                            <BtnHint
                              tryCnt={hint.Try}
                              maxCnt={hint.Max}
                              onClickHint={clickHint}
                            />
                          )}
                        </>
                      ) : (
                        <BtnNext goNext={goNext} />
                      )}
                    </>
                  </Container>
                ) : (
                  <WrapperPenalty
                    isSideOpen={isSideOpen}
                    correctSentence={penaltyData.sentence}
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
