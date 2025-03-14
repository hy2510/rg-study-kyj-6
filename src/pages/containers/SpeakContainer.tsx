import { useContext, useEffect, useState } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'

import '@stylesheets/fonts/font.scss'
import SpeakCSS from '@stylesheets/speak.module.scss'
import imgDodoSpeakIntro from '@assets/images/speak/dodo_23_1.png'

import MobileDetect from 'mobile-detect'

import { useFetchSpeak } from '@hooks/study/useFetch'
import { getSpeakData } from '@services/speakApi'

import SpeakPC from '@pages/speak/SpeakPC'
import SpeakMobile from '@pages/speak/SpeakMobile'
import { LottieRecordAniBig } from '@components/common/LottieAnims'

const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

export type PlayBarState =
  | ''
  | 'reset'
  | 'playing-sentence'
  | 'recording'
  | 'playing-user-audio'
  | 'correct'
  | 'incorrect'

export default function SpeakContainer() {
  const { handler, studyInfo, bookInfo } = useContext(
    AppContext,
  ) as AppContextProps

  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [windowHeight, setWindowHeight] = useState(window.innerHeight)

  const [isStepIntro, setStepIntro] = useState(true)

  // 퀴즈 데이터 / 저장된 데이터
  const [speakData, recordedData] = useFetchSpeak(getSpeakData, {
    mode: studyInfo.mode,
    studentHistoryId: studyInfo.studentHistoryId,
    studyId: studyInfo.studyId,
  })
  const [isRetry, setIsRetry] = useState(false)
  const [tryCount, setTryCount] = useState(0)
  const [quizIndex, setQuizIndex] = useState(0)
  const [playBarState, setPlayBarState] = useState<PlayBarState>('')

  const [isIntroOpen, setIsIntroOpen] = useState(true)

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
    if (speakData) {
      // 현재 퀴즈 번호
      let nextIndex = 0

      if (recordedData.length > 0) {
        // 기록이 있는 경우
        const laseRecordedData = recordedData[recordedData.length - 1]

        const lastIndex = speakData.findIndex(
          (data) =>
            data.Page === laseRecordedData.Page &&
            data.Sequence === laseRecordedData.Sequence &&
            data.DataPath !== '',
        )

        nextIndex = lastIndex + 1
      }

      while (true) {
        if (
          speakData[nextIndex].Contents !== '' &&
          speakData[nextIndex].DataPath !== ''
        ) {
          break
        }

        nextIndex++
      }

      setQuizIndex(nextIndex)
    }
  }, [speakData])

  /**
   * 스피킹 데이터 index값 변경
   * @param index
   */
  const changeQuizIndex = (index: number) => {
    setQuizIndex(index)
  }

  /**
   * 하단 play bar 상태 변경
   * @param state
   */
  const changePlayBarState = (state: PlayBarState) => {
    setPlayBarState(state)
  }

  /**
   * 시도 횟수 증가
   */
  const increaseTryCount = () => {
    setTryCount(tryCount + 1)
  }

  /**
   * 시도 횟수 초기화
   */
  const resetTryCount = () => {
    setTryCount(0)
  }

  const changeTryCount = (value: number) => {
    setTryCount(value)
  }

  const closeStepIntro = () => {
    setStepIntro(false)
  }

  const changeRetry = (state: boolean) => {
    setIsRetry(state)
  }

  if (!speakData) return <>Loading...</>

  // 디폴트 화면
  return (
    <>
      {isStepIntro ? (
        <div
          className={SpeakCSS.screenBlock}
          style={{ backgroundImage: `url(${bookInfo.BackgroundImage})` }}
        >
          <div
            className={`${SpeakCSS.speakButtonArea} animate__animated ${
              isIntroOpen ? 'animate__bounceInRight' : 'animate__bounceOutLeft'
            }`}
          >
            <img
              src={imgDodoSpeakIntro}
              alt=""
              width={150}
              height={'auto'}
              style={{ position: 'relative', zIndex: 2 }}
            />
            <div
              className={SpeakCSS.startButton}
              onClick={() => {
                setIsIntroOpen(false)
                setTimeout(() => {
                  closeStepIntro()
                }, 1000)
              }}
            >
              Let's Speak!
            </div>
            <div
              className={`${SpeakCSS.recAni} animate__animated ${
                isIntroOpen ? 'animate__zoomIn' : 'animate__zoomOut'
              }`}
            >
              <LottieRecordAniBig />
            </div>
          </div>
          <div className={SpeakCSS.screenBgColor}></div>
        </div>
      ) : (
        <>
          {isMobile ? (
            <div
              className={SpeakCSS.speackBodyBg}
              style={{ backgroundImage: `url(${bookInfo.BackgroundImage})` }}
            >
              <div style={{ position: 'relative', zIndex: 2 }}>
                <SpeakMobile
                  playBarState={playBarState}
                  tryCount={tryCount}
                  speakData={speakData}
                  isRetry={isRetry}
                  quizIndex={quizIndex}
                  changeQuizIndex={changeQuizIndex}
                  changePlayBarState={changePlayBarState}
                  increaseTryCount={increaseTryCount}
                  resetTryCount={resetTryCount}
                  changeTryCount={changeTryCount}
                  changeRetry={changeRetry}
                />
              </div>
              <div className={SpeakCSS.speackBodyBgColor}></div>
            </div>
          ) : (
            <div
              className={SpeakCSS.speackBodyBg}
              style={{ backgroundImage: `url(${bookInfo.BackgroundImage})` }}
            >
              <div style={{ position: 'relative', zIndex: 2 }}>
                <SpeakPC
                  playBarState={playBarState}
                  tryCount={tryCount}
                  speakData={speakData}
                  isRetry={isRetry}
                  quizIndex={quizIndex}
                  changeQuizIndex={changeQuizIndex}
                  changePlayBarState={changePlayBarState}
                  increaseTryCount={increaseTryCount}
                  resetTryCount={resetTryCount}
                  changeTryCount={changeTryCount}
                  changeRetry={changeRetry}
                />
              </div>
              <div className={SpeakCSS.speackBodyBgColor}></div>
            </div>
          )}
        </>
      )}
    </>
  )
}
