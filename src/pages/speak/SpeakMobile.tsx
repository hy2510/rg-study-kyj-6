import { useContext, useEffect, useRef, useState } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'

import MobileDetect from 'mobile-detect'
import { SCORE_SPEAK_PASS } from '@constants/constant'

// utils & hooks
import PlayBar from '@components/speak/PlayBar'
import Content from '@components/speak/Content'
import Header from '@components/speak/Header'
import {
  IRecordResultData,
  ISpeakUserAnswer,
  SpeakPageProps,
} from '@interfaces/ISpeak'
import useSpeakingAudioPC from '@hooks/speak/useSpeakingAudio'
import useRecorder from '@hooks/speak/useRecorder'

import { PlayBarState } from '@pages/containers/SpeakContainer'
import { saveSpeakResult } from '@services/speakApi'
import ResultRecord from '@components/speak/ResultRecord'
import ResultSpeak from '@components/speak/ResultSpeak'

const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type SpeakMobileProps = {
  playBarState: PlayBarState
  tryCount: number
  speakData: SpeakPageProps[]
  isRetry: boolean
  quizIndex: number
  changeQuizIndex: (index: number) => void
  changePlayBarState: (state: PlayBarState) => void
  increaseTryCount: () => void
  resetTryCount: () => void
  changeTryCount: (value: number) => void
  changeRetry: (state: boolean) => void
}

export default function SpeakMobile({
  playBarState,
  tryCount,
  speakData,
  isRetry,
  quizIndex,
  changeQuizIndex,
  changePlayBarState,
  increaseTryCount,
  resetTryCount,
  changeTryCount,
  changeRetry,
}: SpeakMobileProps) {
  const { studyInfo, bookInfo } = useContext(AppContext) as AppContextProps

  const isWorking = useRef(false)
  const passState = useRef<'' | 'PASS' | 'FAIL'>('')
  const [isFinishSpeak, setFinishSpeak] = useState(false)

  // audio
  const { pageSeq, playAudio, stopAudio, changePageSeq } = useSpeakingAudioPC({
    speakData: speakData,
    quizIndex: quizIndex,
    changeQuizIndex: changeQuizIndex,
    changePlayBarState: changePlayBarState,
  })

  // recorder
  const { userAudio, startRecording } = useRecorder()

  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [windowHeight, setWindowHeight] = useState(window.innerHeight)
  const [sentenceScore, setSentenceScore] = useState<IRecordResultData>()
  const [isResultRecord, setRecordResult] = useState(false)

  // 창 크기가 변경되거나 가로/세로가 변경되는 등의 행위가 일어나면
  useEffect(() => {
    const resizeHandler = () => {
      setWindowWidth(window.innerWidth)
      setWindowHeight(window.innerHeight)
    }

    resizeHandler()

    // resize시 넓이 / 높이 조절
    window.addEventListener('resize', resizeHandler)

    return () => {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [isMobile, windowHeight])

  useEffect(() => {
    if (sentenceScore) {
      const isPass =
        sentenceScore.total_score >= SCORE_SPEAK_PASS &&
        sentenceScore.phoneme_result.sentence_score >= SCORE_SPEAK_PASS
          ? true
          : false

      const avgScore =
        (sentenceScore.total_score +
          sentenceScore.phoneme_result.sentence_score) /
        2

      if (isPass) {
        // 점수가 통과하는 점수거나
        saveResult(avgScore)
      } else {
        if (tryCount + 1 >= 3) {
          // 기회를 모두 소진했을 경우
          saveResult(avgScore)
        } else {
          setRecordResult(true)
        }
      }
    }
  }, [sentenceScore])

  useEffect(() => {
    if (playBarState === '') {
      setSentenceScore(undefined)
      isWorking.current = false
    } else if (playBarState === 'reset') {
      changePlayBarState('')
    }
  }, [playBarState])

  /**
   * use effect - result record
   */
  useEffect(() => {
    if (sentenceScore) {
      if (!isResultRecord) {
        // 녹음 결과창을 닫으면
        const lastQuiz = speakData.filter(
          (data, i) =>
            data.Sentence !== null && i > quizIndex && data.QuizNo > 0,
        )

        const isLastQuiz = lastQuiz.length > 0 ? false : true

        if (isRetry) {
          isWorking.current = false
          changeTryCount(-1)
          changePlayBarState('')
          playSentence()
          setSentenceScore(undefined)
        } else {
          const isPass =
            sentenceScore.total_score >= SCORE_SPEAK_PASS &&
            sentenceScore.phoneme_result.sentence_score >= SCORE_SPEAK_PASS
              ? true
              : false

          const avgScore =
            (sentenceScore.total_score +
              sentenceScore.phoneme_result.sentence_score) /
            2

          if (isPass && avgScore >= SCORE_SPEAK_PASS) {
            if (isLastQuiz) {
              setFinishSpeak(true)
            } else {
              changeQuizIndex(quizIndex + 1)
            }
          } else {
            // 실패
            if (tryCount + 1 >= 3) {
              // 기회가 초과된 경우 다음 문제로
              if (isLastQuiz) {
                setFinishSpeak(true)
              } else {
                changeQuizIndex(quizIndex + 1)
              }
            } else {
              if (tryCount === -1) {
                // 기회가 초과된 경우 다음 문제로
                if (isLastQuiz) {
                  setFinishSpeak(true)
                } else {
                  changeQuizIndex(quizIndex + 1)
                }
              } else {
                // 기회가 남아있는 경우
                increaseTryCount()
              }
            }
          }
        }
      }
    }
  }, [isResultRecord])

  /**
   * 통과한 문장 다시
   */
  useEffect(() => {
    if (isRetry) {
      changeRecordResult(false)
    } else {
      if (sentenceScore) {
        changeRecordResult(false)
      }
    }
  }, [isRetry])

  /**
   * use effect - quiz index
   * quiz index가 변경되면 다음 문제로 넘어간 것으로 판단
   */
  useEffect(() => {
    setSentenceScore(undefined)
    resetTryCount()

    isWorking.current = false
  }, [quizIndex])

  /**
   * 도전 횟수
   */
  useEffect(() => {
    if (tryCount >= 3) {
      setRecordResult(true)
    } else {
      isWorking.current = false

      playSentence()
      changePlayBarState('')
    }
  }, [tryCount])

  /**
   * 문장 클릭한 경우
   * @param pageNumber 페이지 번호
   * @param sequence  재생 중인 문장
   */
  const clickSentence = () => {
    if (!isWorking.current) playSentence()
  }

  /**
   * 문장 재생하는 함수
   */
  const playSentence = () => {
    if (!isWorking.current) {
      isWorking.current = true

      changePlayBarState('playing-sentence')
      playAudio('', pageSeq.playPage, pageSeq.sequnce)
    }
  }

  /**
   * 녹음 후 문장 점수 바꾸기 위한 함수
   * @param data
   */
  const changeSentenceScore = (data: any) => {
    setSentenceScore(data)
  }

  /**
   * 녹음
   */
  const startRecord = () => {
    if (!isWorking.current) {
      isWorking.current = true
      stopAudio()

      startRecording(
        studyInfo.studyId,
        studyInfo.studentHistoryId,
        bookInfo.BookCode,
        speakData[quizIndex].QuizNo,
        tryCount,
        speakData[quizIndex].Sentence,
        speakData[quizIndex].SoundPath,
        changePlayBarState,
        changeSentenceScore,
      )
    }
  }

  /**
   * 스피킹 결과 저장
   * @param score
   */
  const saveResult = async (score: number) => {
    const lastQuiz = speakData.filter(
      (data, i) => data.Sentence !== null && i > quizIndex && data.QuizNo > 0,
    )

    const isLastQuiz = lastQuiz.length > 0 ? false : true

    const userAnswer: ISpeakUserAnswer = {
      studyId: studyInfo.studyId,
      studentHistoryId: studyInfo.studentHistoryId,
      challengeNumber: speakData[0].ChallengeNumber,
      page: speakData[quizIndex].Page,
      sequence: speakData[quizIndex].Sequence,
      quizNo: speakData[quizIndex].QuizNo,
      sentence: speakData[quizIndex].Sentence,
      scoreOverall: score,
      wordsJson: JSON.stringify(sentenceScore),
      isLastQuiz: isLastQuiz,
    }

    let res

    if (!isRetry) {
      res = await saveSpeakResult(userAnswer)
    } else {
      res = {
        result: 0,
        resultMessage: '',
      }
    }

    if (Number(res.result) === 0) {
      setRecordResult(true)

      if (res.resultMessage === 'PASS' || res.resultMessage === 'FAIL') {
        passState.current = res.resultMessage
      }
    }
  }

  const changeRecordResult = (state: boolean) => {
    setRecordResult(state)
  }

  const progressWidth =
    (speakData[quizIndex].Page / speakData[speakData.length - 1].Page) * 100

  return (
    <>
      {isFinishSpeak ? (
        <ResultSpeak isPass={passState.current === 'PASS' ? true : false} />
      ) : (
        <>
          <div
            style={{
              width: windowWidth,
              height: windowHeight,
            }}
          >
            {/* header */}
            <Header />

            {/* contents */}
            <Content
              pageNumber={pageSeq.playPage}
              pageSeq={pageSeq}
              speakData={speakData}
              clickSentence={clickSentence}
            />

            {/* play bar */}
            <PlayBar
              progressWidth={progressWidth}
              playBarState={playBarState}
              nativeAudio={speakData[quizIndex].SoundPath}
              playSentence={playSentence}
              startRecord={startRecord}
            />

            {/* result - record */}
            {isResultRecord ? (
              <>
                {sentenceScore && (
                  <ResultRecord
                    isRetry={isRetry}
                    sentence={speakData[quizIndex].Sentence}
                    sentenceScore={sentenceScore}
                    tryCount={tryCount}
                    nativeAudio={speakData[quizIndex].SoundPath}
                    userAudio={userAudio}
                    changeRecordResult={changeRecordResult}
                    changeRetry={changeRetry}
                  />
                )}
              </>
            ) : (
              <></>
            )}
          </div>
        </>
      )}
    </>
  )
}
