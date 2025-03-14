import { useEffect, useRef } from 'react'

import SpeakCSS from '@stylesheets/speak.module.scss'

import PlayBarDefault from './menu-play-bar/PlayBarDefault'
import PlayBarRecording from './menu-play-bar/PlayBarRecording'
import PlayBarPlaySentence from './menu-play-bar/PlayBarPlaySentence'

type PlayBarState =
  | ''
  | 'reset'
  | 'playing-sentence'
  | 'recording'
  | 'playing-user-audio'
  | 'correct'
  | 'incorrect'

type PlayBarProps = {
  progressWidth: number
  playBarState: PlayBarState
  nativeAudio: string
  playSentence: () => void
  startRecord: () => void
}

export default function PlayBar({
  progressWidth,
  playBarState,
  nativeAudio,
  playSentence,
  startRecord,
}: PlayBarProps) {
  const nativeAudioRef = useRef(new Audio(nativeAudio))
  const nativeAud = nativeAudioRef.current
  const recordProgressRef = useRef<HTMLDivElement>(null)
  let changeProgress: string | number | NodeJS.Timeout | undefined

  useEffect(() => {
    if (
      recordProgressRef.current &&
      playBarState === 'recording' &&
      nativeAudio
    ) {
      let per = 0
      const additionSec = nativeAud.duration >= 5 ? 1.4 : 1.2
      const recordDuration = nativeAud.duration * 1000 * additionSec

      changeProgress = setInterval(() => {
        per += 25

        if (recordProgressRef.current) {
          if (per / recordDuration > 1) {
            clearInterval(changeProgress)
          } else {
            recordProgressRef.current.style.width = `${
              (per / recordDuration) * 100
            }%`
          }
        }
      }, 25)
    } else {
      clearInterval(changeProgress)
    }

    return () => {
      clearInterval(changeProgress)
    }
  }, [playBarState])

  return (
    <div>
      <div className={SpeakCSS.playBar}>
        <div className={SpeakCSS.progress}>
          <div
            className={SpeakCSS.progressBar}
            style={{ width: `${progressWidth}%` }}
          ></div>
        </div>

        {/* play bar 내부에 아이콘이 들어갈 곳 */}
        <div className={SpeakCSS.wrapperAnims}>
          {playBarState === '' && (
            <PlayBarDefault
              playSentence={playSentence}
              startRecord={startRecord}
            />
          )}

          {playBarState === 'playing-sentence' && <PlayBarPlaySentence />}

          {playBarState === 'recording' && (
            <>
              <PlayBarRecording />

              {/* 녹음진행시간 프로그래스바 */}
              <div
                ref={recordProgressRef}
                className={SpeakCSS.recProgress}
              ></div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
