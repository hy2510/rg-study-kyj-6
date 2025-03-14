import { useEffect, useRef, useState } from 'react'
import { isIOS, isSafari } from 'react-device-detect'

import {
  SpeakPageProps,
  PageSequenceProps,
  PlayState,
} from '@interfaces/ISpeak'
import { PlayBarState } from '@pages/containers/SpeakContainer'

type StoryAudioPCProps = {
  speakData: SpeakPageProps[]
  quizIndex: number
  changeQuizIndex: (index: number) => void
  changePlayBarState: (state: PlayBarState) => void
}

export default function useSpeakingAudioPC({
  speakData,
  quizIndex,
  changeQuizIndex,
  changePlayBarState,
}: StoryAudioPCProps) {
  // 오디오
  const playerRef = useRef(new Audio())
  const player = playerRef.current
  player.autoplay = true

  const [pageSeq, setPageSeq] = useState<PageSequenceProps>({
    playPage: speakData[quizIndex].Page,
    sequnce: speakData[quizIndex].Sequence,
  })

  // 페이지가 바뀌면
  useEffect(() => {
    if (speakData) {
      const isNext = speakData[quizIndex].Sequence === 999

      if (isNext) {
        changeQuizIndex(quizIndex + 1)
      } else {
        setPageSeq({
          playPage: speakData[quizIndex].Page,
          sequnce: speakData[quizIndex].Sequence,
        })
      }
    }
  }, [quizIndex])

  // 이벤트 핸들러 부여
  useEffect(() => {
    // 오디오가 재생 가능할 때
    const handlerCanPlayThrough = () => {
      player
        .play()
        .then(() => {
          changePlayBarState('playing-sentence')
        })
        .catch((e) => {
          changePlayBarState('reset')
        })
        .finally(() => {
          console.log('finally')
        })
    }
    // 오디오가 재생 가능할 때 end

    // 오디오가 재생 완료
    const handlerEnded = () => {
      changePlayBarState('')
    }
    // 오디오가 재생 완료 end

    player.addEventListener('canplaythrough', handlerCanPlayThrough)
    player.addEventListener('ended', handlerEnded)

    playAudio('', pageSeq.playPage, pageSeq.sequnce)

    return () => {
      player.removeEventListener('canplaythrough', handlerCanPlayThrough)
      player.removeEventListener('ended', handlerEnded)

      stopAudio()
    }
  }, [pageSeq])

  /**
   * 오디오 재생
   * @param pageNumber: 페이지 번호
   * @param seq: 문장 번호
   */
  const playAudio = async (
    playBarState: PlayBarState,
    pageNumber: number,
    seq: number,
  ) => {
    if (playBarState === '') {
      const sentenceData = speakData.find(
        (data) => data.Page === pageNumber && data.Sequence === pageSeq.sequnce,
      )

      if (sentenceData) {
        const response = await fetch(sentenceData.SoundPath)

        if (response.ok) {
          player.src = sentenceData.SoundPath
        }
      } else {
        player.src = ''
        player.currentTime = 0
      }
    }
  }

  /**
   * 오디오 중지
   */
  const stopAudio = () => {
    player.pause()
    player.src = ''
    player.currentTime = 0

    changePlayBarState('')
  }

  const changePageSeq = (page: number, seq: number) => {
    setPageSeq({
      playPage: page,
      sequnce: seq,
    })
  }

  return {
    pageSeq,
    playAudio,
    stopAudio,
    changePageSeq,
  }
}
