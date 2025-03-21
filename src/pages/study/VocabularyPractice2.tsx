import { useEffect, useState, useContext, useRef } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useTranslation } from 'react-i18next'

import { getVocabularyPractice2 } from '@services/quiz/VocabularyAPI'

import vocabularyCSS from '@stylesheets/vocabulary-practice.module.scss'
import vocabularyCSSMobile from '@stylesheets/mobile/vocabulary-practice.module.scss'

// Types [
import { IStudyData } from '@interfaces/Common'
export type PlayBarState = '' | 'reset' | 'recording'
export type MultiPlayStateProps = {
  playState: PlayState
  playType: '' | 'word' | 'sentence'
}
import { IPhonemeResult } from '@interfaces/ISpeak'
import { SCORE_SPEAK_PASS } from '@constants/constant'
// ] Types

// utils & hooks
import useStepIntro from '@hooks/common/useStepIntro'
import { useQuizTimer } from '@hooks/study/useQuizTimer'
import { useFetch } from '@hooks/study/useFetch'
import { useStudentAnswer } from '@hooks/study/useStudentAnswer'
import useStudyAudio, { PlayState } from '@hooks/study/useStudyAudio'
import { useRecorderVoca } from '@hooks/study/useRecorderVoca'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

// components - common
import StepIntro from '@components/study/common-study/StepIntro'
import QuizHeader from '@components/study/common-study/QuizHeader'
import QuizBody from '@components/study/common-study/QuizBody'
import Container from '@components/study/common-study/Container'
import StudySideMenu from '@components/study/common-study/StudySideMenu'

// components - vocabulary practice 2
import Card from '@components/study/vocabulary-practice-02/Card'
import Indicator from '@components/study/vocabulary-practice-02/Indicator'
import BtnNext from '@components/study/vocabulary-practice-02/BtnNext'

const STEP_TYPE = 'Vocabulary Practice'

const style = isMobile ? vocabularyCSSMobile : vocabularyCSS

export default function VocabularyPractice2(props: IStudyData) {
  const { t } = useTranslation()
  const { studyInfo, bookInfo } = useContext(AppContext) as AppContextProps
  const STEP = props.currentStep

  const { startRecording } = useRecorderVoca()

  const timer = useQuizTimer(() => {
    // timer가 0에 도달하면 호출되는 콜백함수 구현
    window.onLogoutStudy()
  })

  // 인트로
  const [introAnim, setIntroAnim] = useState<
    'animate__bounceInRight' | 'animate__bounceOutLeft'
  >('animate__bounceInRight')
  const { isStepIntro, closeStepIntro } = useStepIntro() // 데이터 가져오기
  const [isSideOpen, setSideOpen] = useState(false)

  // 퀴즈 데이터 세팅
  const isWorking = useRef(true)

  // 퀴즈 데이터 세팅
  const { scoreBoardData } = useStudentAnswer(studyInfo.mode)
  const [quizData, recordedData] = useFetch(getVocabularyPractice2, props, STEP) // 퀴즈 데이터 / 저장된 데이터
  const [quizNo, setQuizNo] = useState<number>(1) // 퀴즈 번호
  const [recTryCnt, setRecTryCnt] = useState(0)

  // 마지막 장까지 봤는지
  const [isLastPage, setIsLastPage] = useState(false)

  // audio
  const { playAudio, stopAudio } = useStudyAudio()
  // 음원이 여러 개인 경우를 위해서
  const [multiPlayState, setMultiPlayState] = useState<MultiPlayStateProps>({
    playState: '',
    playType: '',
  })

  // 스피킹모드
  const [playBarState, setPlayBarState] = useState<PlayBarState>('')
  const [phonemeScore, setPhonemeScore] = useState<IPhonemeResult>()
  const [isSpeakResult, setIsSpeakResult] = useState(false)

  // 인트로가 없어지면
  useEffect(() => {
    if (!isStepIntro && quizData) {
      timer.setup(quizData.QuizTime, true)

      setTimeout(() => {
        playBoth()
      }, 500)

      isWorking.current = false
    }
  }, [isStepIntro])

  // 퀴즈 번호가 바뀌면 다음 카드인 상황
  useEffect(() => {
    if (!isStepIntro && quizData) {
      stopAudio()
      setRecTryCnt(0)

      if (quizNo === quizData.Quiz.length) {
        setIsLastPage(true)
      }

      playBoth()
    }
  }, [quizNo])

  // 플레이어 상태가 변하면
  useEffect(() => {
    if (
      quizData &&
      multiPlayState.playState === '' &&
      quizNo === Object.keys(quizData.Quiz).length
    ) {
      setIsLastPage(true)
      stopAudio()
    }
  }, [multiPlayState])

  useEffect(() => {
    if (!isStepIntro && !isLastPage) {
      setQuizNo(1)
    }
  }, [isLastPage])

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
    if (playBarState === '' && phonemeScore && quizData) {
      isWorking.current = false

      setPhonemeScore(undefined)
      setIsSpeakResult(false)

      if (phonemeScore.average_phoneme_score >= SCORE_SPEAK_PASS) {
        if (quizNo + 1 <= Object.keys(quizData.Quiz).length) {
          changeQuizNo(quizNo + 1)
        }
      }
    } else if (playBarState === 'reset') {
      changePlayBarState('')
    }
  }, [playBarState])

  if (!quizData) return <div>Loading...</div>

  /**
   * 퀴즈 번호 변경
   * @param value 퀴즈 번호
   */
  const changeQuizNo = (value: number) => {
    if (value < 1) {
      if (isLastPage) setQuizNo(Object.keys(quizData.Quiz).length)
    } else if (value > Object.keys(quizData.Quiz).length) {
      setQuizNo(1)
    } else {
      setQuizNo(value)
    }
  }

  /**
   * 단어만 재생
   */
  const playWord = () => {
    stopAudio()

    if (
      multiPlayState.playState === 'playing' &&
      multiPlayState.playType === 'word'
    ) {
      setMultiPlayState({
        playState: '',
        playType: '',
      })
    } else {
      setMultiPlayState({
        playState: 'playing',
        playType: 'word',
      })

      const cbAfterPlayWord = () => {
        setMultiPlayState({
          playState: '',
          playType: '',
        })
      }

      playAudio(quizData.Quiz[quizNo - 1].Question.WordSound, cbAfterPlayWord)
    }
  }

  /**
   * 문장만 재생
   */
  const playSentence = () => {
    stopAudio()

    if (
      multiPlayState.playState === 'playing' &&
      multiPlayState.playType === 'sentence'
    ) {
      setMultiPlayState({
        playState: '',
        playType: '',
      })
    } else {
      setMultiPlayState({
        playState: 'playing',
        playType: 'sentence',
      })

      const cbAfterPlaySentence = () => {
        setMultiPlayState({
          playState: '',
          playType: '',
        })
      }

      playAudio(quizData.Quiz[quizNo - 1].Question.Sound, cbAfterPlaySentence)
    }
  }

  /**
   * 단어 재생 후 문장 재생
   */
  const playBoth = () => {
    stopAudio()

    setMultiPlayState({
      playState: 'playing',
      playType: 'word',
    })

    const afterPlatSentence = () => {
      setMultiPlayState({
        playState: '',
        playType: '',
      })
    }

    const cbAfterPlayWord = () => {
      setMultiPlayState({
        playState: 'playing',
        playType: 'sentence',
      })

      playAudio(quizData.Quiz[quizNo - 1].Question.Sound, afterPlatSentence)
    }

    playAudio(quizData.Quiz[quizNo - 1].Question.WordSound, cbAfterPlayWord)
  }

  /**
   * 헤더 메뉴 클릭하는 기능
   */
  const changeSideMenu = (state: boolean) => {
    setSideOpen(state)
  }

  /**
   * 단어 학습으로
   */
  const goTest = () => {
    stopAudio()
    props.changeVocaState(false)
  }

  /**
   * 녹음 시작
   */
  const startRecord = () => {
    if (!isWorking.current) {
      isWorking.current = true
      stopAudio()
      setMultiPlayState({
        playState: '',
        playType: '',
      })

      startRecording(
        studyInfo.studyId,
        studyInfo.studentHistoryId,
        bookInfo.BookCode,
        quizNo,
        recTryCnt,
        quizData.Quiz[quizNo - 1].Question.Word,
        quizData.Quiz[quizNo - 1].Question.WordSound,
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
            comment={t('study.카드를 넘기면서 단어를 학습하세요.')}
            onStepIntroClozeHandler={() => {
              setIntroAnim('animate__bounceOutLeft')
            }}
          />
        </div>
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
            <Container
              typeCSS={style.vocabularyPractice2}
              containerCSS={style.container}
            >
              <Card
                isSpeakResult={isSpeakResult}
                playBarState={playBarState}
                cardInfo={quizData.Quiz[quizNo - 1]}
                phonemeScore={phonemeScore}
                multiPlayState={multiPlayState}
                playWord={playWord}
                startRecord={startRecord}
                playSentence={playSentence}
                changePlayBarState={changePlayBarState}
              />

              <Indicator
                isLastPage={isLastPage}
                quizNo={quizNo}
                totalQuizCnt={quizData.Quiz.length}
                changeQuizNo={changeQuizNo}
              />

              <>{isLastPage && <BtnNext goTest={goTest} />}</>
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
  )
}
