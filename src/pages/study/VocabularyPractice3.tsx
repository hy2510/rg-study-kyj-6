import { useEffect, useState, useContext, useRef } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useTranslation } from 'react-i18next'

import { saveUserAnswer } from '@services/studyApi'
import { getVocabularyPractice3 } from '@services/quiz/VocabularyAPI'

import vocabularyCSS from '@stylesheets/vocabulary-practice.module.scss'
import vocabularyCSSMobile from '@stylesheets/mobile/vocabulary-practice.module.scss'

// Types [
import {
  IStudyData,
  IScoreBoardData as IScoreBoard,
  IUserAnswer,
} from '@interfaces/Common'
import { IPhonemeResult } from '@interfaces/ISpeak'
import { SCORE_SPEAK_PASS } from '@constants/constant'
// ] Types

// utils & hooks
import useStepIntro from '@hooks/common/useStepIntro'
import { useQuizTimer } from '@hooks/study/useQuizTimer'
import { useFetch } from '@hooks/study/useFetch'
import { useCurrentQuizNoVocaPractice } from '@hooks/study/useCurrentQuizNo'
import { useStudentAnswer } from '@hooks/study/useStudentAnswer'
import useStudyAudio from '@hooks/study/useStudyAudio'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()
import { useResult } from '@hooks/study/useResult'

// components - common
import StepIntro from '@components/study/common-study/StepIntro'
import QuizHeader from '@components/study/common-study/QuizHeader'
import QuizBody from '@components/study/common-study/QuizBody'
import Container from '@components/study/common-study/Container'
import StudySideMenu from '@components/study/common-study/StudySideMenu'
import Gap from '@components/study/common-study/Gap'

// components - vocabulary practice 3
import TestResultVP3 from '@components/study/vocabulary-practice-03/TestResultVP3'
import useRecorderVoca from '@hooks/study/useRecorderVoca'
import WrapperCard from '@components/study/vocabulary-practice-03/WrapperCard'

const STEP_TYPE = 'Vocabulary Practice'

const style = isMobile ? vocabularyCSSMobile : vocabularyCSS

export type PlayBarState = '' | 'reset' | 'recording'

export default function VocabularyPractice3(props: IStudyData) {
  const { t } = useTranslation()
  const { handler, studyInfo, bookInfo } = useContext(
    AppContext,
  ) as AppContextProps
  const STEP = props.currentStep

  const { startRecording } = useRecorderVoca()

  const timer = useQuizTimer(() => {
    // timer가 0에 도달하면 호출되는 콜백함수 구현
    window.onLogoutStudy()
  })

  // 인트로 및 결과창
  // 인트로
  const [introAnim, setIntroAnim] = useState<
    'animate__bounceInRight' | 'animate__bounceOutLeft'
  >('animate__bounceInRight')
  const { isStepIntro, closeStepIntro } = useStepIntro() // 데이터 가져오기
  const { isResultShow, changeResultShow } = useResult()
  const [isSideOpen, setSideOpen] = useState(false)

  // 퀴즈 데이터 세팅
  const isWorking = useRef(true)

  // 퀴즈 데이터 / 저장된 데이터
  const [quizData, recordedData] = useFetch(
    getVocabularyPractice3,
    props,
    `${STEP}P`,
  )
  const [quizNo, setQuizNo] = useState<number>(1) // 퀴즈 번호
  const {
    scoreBoardData,
    setStudentAnswers,
    addStudentAnswer,
    resetStudentAnswer,
    makeUserAnswerData,
  } = useStudentAnswer(studyInfo.mode)
  const [tryCount, setTryCount] = useState(0) // 시도 횟수
  const [recTryCnt, setRecTryCnt] = useState(0)

  // input ref
  const [inputVal, setInputVal] = useState<string>('')

  // audio
  const { playState, playAudio, stopAudio } = useStudyAudio()

  const [isRetry, setRetry] = useState(false)

  // 스피킹모드
  const [playBarState, setPlayBarState] = useState<PlayBarState>('')
  const [phonemeScore, setPhonemeScore] = useState<IPhonemeResult>()
  const [isSpeakResult, setIsSpeakResult] = useState(false)

  // 인트로가 없어지면
  useEffect(() => {
    if (!isStepIntro && quizData) {
      timer.setup(quizData.QuizTime, true)

      if (studyInfo.mode === 'staff') {
        setInputVal(quizData.Quiz[quizNo - 1].Question.Text)
      }

      playWord()
      isWorking.current = false
    }
  }, [isStepIntro])

  useEffect(() => {
    if (quizData) {
      // 현재 퀴즈 번호
      const [currentQuizNo, tryCnt] = useCurrentQuizNoVocaPractice(
        studyInfo.mode,
        recordedData,
        quizData.QuizAnswerCount,
      )

      if (quizData.Quiz.length < currentQuizNo) {
        goVocaTest()
      } else {
        if (recordedData.length > 0) {
          setStudentAnswers(recordedData, quizData.QuizAnswerCount) // 기존 데이터를 채점판에 넣어주기
        }

        setTryCount(tryCnt)
        setQuizNo(currentQuizNo)
      }
    }
  }, [quizData])

  // quiz no 변경되면 다음 단어
  useEffect(() => {
    if (quizData && !isStepIntro) {
      if (studyInfo.mode === 'staff') {
        setInputVal(quizData.Quiz[quizNo - 1].Question.Text)
      } else {
        setInputVal('')
      }

      setTryCount(0)
      setRecTryCnt(0)

      playWord()
      isWorking.current = false
    }
  }, [quizNo])

  useEffect(() => {
    if (isResultShow) {
      setRetry(false)
    }
  }, [isResultShow])

  useEffect(() => {
    if (isRetry) {
      resetStudentAnswer()
      setQuizNo(1)

      changeResultShow(false)
    }
  }, [isRetry])

  /**
   * use effect - sentence score
   * 문장 점수가 바뀌면 녹음이 된 것으로 판단
   */
  useEffect(() => {
    if (phonemeScore) {
      setRecTryCnt(recTryCnt + 1)
      setIsSpeakResult(true)
    }
  }, [phonemeScore])

  /**
   * use effect - play bar state
   */
  useEffect(() => {
    if (playBarState === '' && phonemeScore) {
      isWorking.current = false

      setPhonemeScore(undefined)
      setIsSpeakResult(false)

      if (phonemeScore.average_phoneme_score >= SCORE_SPEAK_PASS) {
        checkAnswer('speaking correctly')
      }
    } else if (playBarState === 'reset') {
      changePlayBarState('')
    }
  }, [playBarState])

  // 로딩
  if (!quizData) return <>Loading...</>

  /**
   * 정답 체크
   */
  const checkAnswer = async (skipType?: string) => {
    try {
      if (!isWorking.current) {
        isWorking.current = true

        if (quizData.IsEnabledTyping) {
          // input이 활성화 된 경우

          let isCorrect = quizData.Quiz[quizNo - 1].Question.Text === inputVal

          if (skipType === 'speaking correctly') {
            isCorrect = true
          }

          if (isCorrect) {
            let res

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
              step: '2P',
              quizId: quizData.Quiz[quizNo - 1].QuizId,
              quizNo: quizData.Quiz[quizNo - 1].QuizNo,
              currentQuizNo: quizNo,
              correct: quizData.Quiz[quizNo - 1].Question.Text,
              selectedAnswer: quizData.Quiz[quizNo - 1].Question.Text,
              tryCount: tryCount + 1,
              maxQuizCount: quizData.QuizAnswerCount,
              quizLength: quizData.Quiz.length,
              isCorrect: isCorrect,
              answerData: answerData,
              isFinishStudy: `${props.lastStep}` === '2P' ? true : false,
            })

            if (isRetry) {
              // 다시 하는 경우 저장하지 않음
              if (tryCount + 1 >= quizData.QuizAnswerCount) {
                if (quizNo + 1 > quizData.Quiz.length) {
                  res = {
                    result: '0',
                    resultMessage: 'finish',
                  }
                } else {
                  res = {
                    result: '0',
                    resultMessage: '',
                  }
                }
              } else {
                res = {
                  result: '0',
                  resultMessage: '',
                }
              }
            } else {
              res = await saveUserAnswer(studyInfo.mode, userAnswer)
            }

            if (Number(res.result) === 0) {
              if (res.resultMessage) {
                handler.finishStudy = {
                  id: Number(res.result),
                  cause: res.resultMessage,
                }
              }

              addStudentAnswer(answerData)

              setTryCount(tryCount + 1)
              setRecTryCnt(0)

              if (tryCount + 1 >= quizData.QuizAnswerCount) {
                if (quizNo + 1 > quizData.Quiz.length) {
                  changeResultShow(true)
                } else {
                  setQuizNo(quizNo + 1)
                }
              } else {
                if (studyInfo.mode === 'staff') {
                  setInputVal(quizData.Quiz[quizNo - 1].Question.Text)
                } else {
                  setInputVal('')
                }

                playWord()

                isWorking.current = false
              }
            }
          } else {
            if (quizData.IsSkipAvailable && skipType) {
              stopAudio()

              // skip이 가능한 경우
              // 채점판 만들기
              const answerData: IScoreBoard = {
                quizNo: quizNo,
                maxCount: quizData.QuizAnswerCount,
                answerCount: tryCount + 1,
                ox: skipType === 'speaking correctly' ? true : isCorrect,
              }

              let res

              // 유저 답 데이터 생성
              const userAnswer: IUserAnswer = makeUserAnswerData({
                mobile: '',
                studyId: props.studyId,
                studentHistoryId: props.studentHistoryId,
                bookType: props.bookType,
                step: '2P',
                quizId: quizData.Quiz[quizNo - 1].QuizId,
                quizNo: quizData.Quiz[quizNo - 1].QuizNo,
                currentQuizNo: quizNo,
                correct: quizData.Quiz[quizNo - 1].Question.Text,
                selectedAnswer:
                  skipType === 'speaking correctly'
                    ? quizData.Quiz[quizNo - 1].Question.Text
                    : inputVal,
                tryCount:
                  skipType === 'user press skip'
                    ? quizData.QuizAnswerCount
                    : tryCount + 1,
                maxQuizCount: quizData.QuizAnswerCount,
                quizLength: quizData.Quiz.length,
                isCorrect: isCorrect,
                answerData: answerData,
                isFinishStudy: `${props.lastStep}` === '2P' ? true : false,
              })

              if (isRetry) {
                // 다시 하는 경우 저장하지 않음
                if (tryCount + 1 >= quizData.QuizAnswerCount) {
                  if (quizNo + 1 > quizData.Quiz.length) {
                    res = {
                      result: '0',
                      resultMessage: 'finish',
                    }
                  } else {
                    res = {
                      result: '0',
                      resultMessage: '',
                    }
                  }
                } else {
                  res = {
                    result: '0',
                    resultMessage: '',
                  }
                }
              } else {
                res = await saveUserAnswer(studyInfo.mode, userAnswer)
              }

              if (Number(res.result) === 0) {
                addStudentAnswer(answerData)

                if (quizNo + 1 > quizData.Quiz.length) {
                  if (skipType === 'user press skip') {
                    changeResultShow(true)
                  } else if (skipType === 'speaking correctly') {
                    if (tryCount + 1 >= quizData.QuizAnswerCount) {
                      changeResultShow(true)
                    } else {
                      setTryCount(tryCount + 1)
                      setRecTryCnt(0)

                      if (studyInfo.mode === 'staff') {
                        setInputVal(quizData.Quiz[quizNo - 1].Question.Text)
                      } else {
                        setInputVal('')
                      }

                      playWord()

                      isWorking.current = false
                    }
                  }
                } else {
                  if (skipType === 'user press skip') {
                    setQuizNo(quizNo + 1)
                  } else if (skipType === 'speaking correctly') {
                    if (tryCount + 1 >= quizData.QuizAnswerCount) {
                      setQuizNo(quizNo + 1)
                    } else {
                      setTryCount(tryCount + 1)
                      setRecTryCnt(0)

                      if (studyInfo.mode === 'staff') {
                        setInputVal(quizData.Quiz[quizNo - 1].Question.Text)
                      } else {
                        setInputVal('')
                      }

                      playWord()

                      isWorking.current = false
                    }
                  }
                }
              }
            } else {
              // skip이 불가능한 경우
              if (studyInfo.mode === 'staff') {
                setInputVal(quizData.Quiz[quizNo - 1].Question.Text)
              } else {
                setInputVal('')
              }

              isWorking.current = false
            }
          }
        } else {
          // input이 비활성화인 경우
          // 채점판 만들기
          const answerData: IScoreBoard = {
            quizNo: quizNo,
            maxCount: quizData.QuizAnswerCount,
            answerCount: tryCount + 1,
            ox: true,
          }

          let res

          // 유저 답 데이터 생성
          const userAnswer: IUserAnswer = makeUserAnswerData({
            mobile: '',
            studyId: props.studyId,
            studentHistoryId: props.studentHistoryId,
            bookType: props.bookType,
            step: '2P',
            quizId: quizData.Quiz[quizNo - 1].QuizId,
            quizNo: quizData.Quiz[quizNo - 1].QuizNo,
            currentQuizNo: quizNo,
            correct: quizData.Quiz[quizNo - 1].Question.Text,
            selectedAnswer: inputVal,
            tryCount: tryCount + 1,
            maxQuizCount: quizData.QuizAnswerCount,
            quizLength: quizData.Quiz.length,
            isCorrect: true,
            answerData: answerData,
            isFinishStudy: `${props.lastStep}` === '2P' ? true : false,
          })

          if (isRetry) {
            // 다시 하는 경우 저장하지 않음
            if (tryCount + 1 >= quizData.QuizAnswerCount) {
              if (quizNo + 1 > quizData.Quiz.length) {
                res = {
                  result: '0',
                  resultMessage: 'finish',
                }
              } else {
                res = {
                  result: '0',
                  resultMessage: '',
                }
              }
            } else {
              res = {
                result: '0',
                resultMessage: '',
              }
            }
          } else {
            res = await saveUserAnswer(studyInfo.mode, userAnswer)
          }

          if (Number(res.result) === 0) {
            addStudentAnswer(answerData)

            if (quizNo + 1 > quizData.Quiz.length) {
              changeResultShow(true)
            } else {
              setQuizNo(quizNo + 1)
            }
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const changeInputVal = (value: string) => {
    setInputVal(value)
  }

  /**
   * 단어 재생
   */
  const playWord = () => {
    if (playState === '' && playBarState === '') {
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

  /**
   * voca test로 가기
   */
  const goVocaTest = () => {
    props.changeVocaState(false)
  }

  /**
   * 다시 연습하기
   * @param state
   */
  const changeRetry = (state: boolean) => {
    setRetry(state)
  }

  /**
   * 녹음 시작
   */
  const startRecord = () => {
    if (!isWorking.current) {
      isWorking.current = true
      stopAudio()

      startRecording(
        studyInfo.studyId,
        studyInfo.studentHistoryId,
        bookInfo.BookCode,
        quizNo,
        recTryCnt,
        quizData.Quiz[quizNo - 1].Question.Text,
        quizData.Quiz[quizNo - 1].Question.Sound,
        changePlayBarState,
        changePhonemeScore,
      )
    }
  }

  /**
   * 하단 play bar 상태 변경
   * @param state
   */
  const changePlayBarState = (state: PlayBarState) => {
    setPlayBarState(state)
  }

  /**
   * 녹음 후 문장 점수 바꾸기 위한 함수
   * @param data
   */
  const changePhonemeScore = (data: any) => {
    setPhonemeScore(data)
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
            comment={t('study.단어를 보고 듣고 따라서 입력하세요.')}
            onStepIntroClozeHandler={() => {
              setIntroAnim('animate__bounceOutLeft')
            }}
          />
        </div>
      ) : (
        <>
          {isResultShow ? (
            <TestResultVP3 goVocaTest={goVocaTest} changeRetry={changeRetry} />
          ) : (
            <>
              <QuizHeader
                quizNumber={quizNo}
                totalQuizCnt={Object.keys(quizData.Quiz).length}
                life={quizData.QuizAnswerCount}
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
                <Gap height={10} />

                <Container
                  typeCSS={style.vocabularyPractice3}
                  containerCSS={style.container}
                >
                  <Gap height={20} />

                  <WrapperCard
                    isSideOpen={isSideOpen}
                    quizData={quizData}
                    quizNo={quizNo}
                    tryCount={tryCount}
                    inputVal={inputVal}
                    playBarState={playBarState}
                    playState={playState}
                    isSpeakResult={isSpeakResult}
                    phonemeScore={phonemeScore}
                    playWord={playWord}
                    changeInputVal={changeInputVal}
                    startRecord={startRecord}
                    checkAnswer={checkAnswer}
                    changePlayBarState={changePlayBarState}
                  />
                </Container>
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
            </>
          )}
        </>
      )}
    </>
  )
}
