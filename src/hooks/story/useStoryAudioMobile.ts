import { useEffect, useMemo, useRef, useState } from 'react'

import { useOrientation } from './useOrientation'
import { submitReadFirstPage, submitReadLastPage } from '@services/storyApi'

import { PageProps, PageSequenceProps, PlayState } from '@interfaces/IStory'

type StoryAudioMobileProps = {
  studyId: string
  studentHistoryId: string
  pageData: PageProps[]
  changeSideMenu: (state: boolean) => void
  storyMode: 'Story' | 'ListenAndRepeat'
  changeStoryMode: (mode: 'Story' | 'ListenAndRepeat') => void
  changeReadingComplete: (studyId: string, studentHistoryId: string) => void
}

export default function useStoryAudioMobile({
  studyId,
  studentHistoryId,
  pageData,
  storyMode,
  changeSideMenu,
  changeStoryMode,
  changeReadingComplete,
}: StoryAudioMobileProps) {
  // 오디오
  const player = useMemo(() => new Audio(), [])
  player.autoplay = true

  // 오디오 상태
  const [playState, setPlayState] = useState<PlayState>('')
  const isFirst = useRef<boolean>(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackRate, setPlaybackRate] = useState<number>(1) // 배속

  const isAutoRef = useRef(true)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSeq, setPageSeq] = useState<PageSequenceProps>({
    playPage: 1,
    sequnce: 0,
  })

  const [readCnt, setReadCnt] = useState<number>(0)

  // 가로, 세로 구분
  const isLandscape = useOrientation()

  // 페이지가 바뀌면
  useEffect(() => {
    if (pageData) {
      const isSound = pageData.find(
        (data) => data.Page === pageNumber && data.SoundPath,
      )

      if (!isSound) {
        setTimeout(() => {
          setPageNumber(pageNumber + 1)
        }, 2000)
      } else {
        setPageSeq({
          playPage: pageNumber,
          sequnce: 0,
        })
      }
    }
  }, [pageNumber])

  // 이벤트 핸들러 부여
  useEffect(() => {
    // 오디오가 재생 가능할 때
    const handlerCanPlayThrough = () => {
      if (!isFirst.current) {
        player.play()
        setPlayState('play')
      } else {
        isFirst.current = false
        pauseAudio()
      }
    }

    player.addEventListener('canplaythrough', handlerCanPlayThrough)
    // 오디오가 재생 가능할 때 end

    // 오디오가 재생 중
    const handlerTimeupdate = () => {
      setCurrentTime(player.currentTime)
    }

    player.addEventListener('timeupdate', handlerTimeupdate)
    // 오디오가 재생 중 end

    // 오디오가 일시 중지
    const handlerPause = () => {}

    player.addEventListener('pause', handlerPause)
    // 오디오가 일시 중지 end

    // 오디오가 재생 완료
    const handlerEnded = () => {
      if (!isFirst.current) {
        // 페이지 자동 넘김 여부
        const isAutoNextPage = isAutoRef.current

        // 다음 페이지 존재 여부
        const isNextPage = pageData.find(
          (data) => data.Page === pageSeq.playPage + 1,
        )

        if (!isLandscape) {
          // 화면 - 한쪽 페이지
          if (isAutoNextPage) {
            if (isNextPage) {
              // 다음 페이지가 존재하면
              setPageSeq({
                playPage: pageSeq.playPage + 1,
                sequnce: 0,
              })
            } else {
              // 다음 페이지가 없는 경우
              setReadCnt(readCnt + 1)
              setPlayState('')
            }
          }
        } else {
          // 화면 - 양쪽 페이지
          if (isAutoNextPage) {
            // 자동으로 넘기는 경우
            if (isNextPage) {
              // 다음 페이지가 존재하는 경우
              if (pageSeq.playPage % 2 === 1) {
                // 왼쪽 페이지일 경우
                setPageSeq({
                  playPage: pageSeq.playPage + 1,
                  sequnce: 0,
                })
              } else {
                setPageNumber(pageNumber + 2)
              }
            } else {
              // 다음 페이지가 존재하지 않는 경우
              setReadCnt(readCnt + 1)
              setPlayState('')
            }
          } else {
            // 자동으로 넘기지 않는 경우
            setPlayState('')
          }
        }
      } else {
        isFirst.current = false
      }
    }

    player.addEventListener('ended', handlerEnded)
    // 오디오가 재생 완료 end

    // 오디오 재생
    playAudio(pageSeq.playPage, pageSeq.sequnce)

    return () => {
      player.removeEventListener('canplaythrough', handlerCanPlayThrough)
      player.removeEventListener('timeupdate', handlerTimeupdate)
      player.removeEventListener('pause', handlerPause)
      player.removeEventListener('ended', handlerEnded)

      stopAudio()
    }
  }, [pageSeq])

  // 음원 재생 속도 변경
  useEffect(() => {
    player.playbackRate = playbackRate
  }, [playbackRate])

  // 읽은 횟수가 변경되는 경우
  useEffect(() => {
    if (readCnt === 1) {
      if (storyMode === 'ListenAndRepeat') {
        setPageNumber(3)
      } else {
        isFirst.current = true
        changeSideMenu(true)
        changePageNumber(1)

        changeReadingComplete(studyId, studentHistoryId)
      }
    } else if (readCnt === 2) {
      if (storyMode === 'ListenAndRepeat') {
        isFirst.current = true
        changeStoryMode('Story')
        changeSideMenu(true)
        changePageNumber(1)

        changeReadingComplete(studyId, studentHistoryId)
      }
    }
  }, [readCnt])

  /**
   * 오디오 재생
   * @param pageNumber: 페이지 번호
   * @param seq: 문장 번호
   */
  const playAudio = (pageNumber: number, seq: number) => {
    const sentenceData = pageData.filter(
      (data) => data.Page === pageNumber && data.SoundPath !== '',
    )

    if (sentenceData.length > 0 && sentenceData.length > seq - 1) {
      if (storyMode === 'ListenAndRepeat' && readCnt === 1) {
        player.src = sentenceData[0].SoundPath2
      } else {
        player.src = sentenceData[0].SoundPath
      }

      player.playbackRate = playbackRate

      if (seq > 0) {
        // seq가 0이 아니면 문장을 클릭했거나 다음 문장으로 하이라이트가 옮긴 경우로 판단
        player.currentTime = sentenceData[seq - 1].StartTime / 1000
      }
    } else {
      player.src = ''
      player.currentTime = 0
    }
  }

  /**
   * 오디오 중지
   */
  const stopAudio = () => {
    player.pause()
    player.src = ''
    player.currentTime = 0

    setPlayState('')
  }

  /**
   * 오디오 일시 정지
   */
  const pauseAudio = () => {
    player.pause()

    setPlayState('pause')
  }

  const pauseAudioByWord = () => {
    player.pause()
  }

  /**
   * 오디오 일시 정지 해제
   */
  const resumeAudio = () => {
    setPlayState('play')
    player.play()
  }

  /**
   * 오디오 배속
   */
  const changePlaySpeed = (speed: number) => {
    setPlaybackRate(speed)
  }

  /**
   * 오디오 재생 시간 변경
   */
  const changeDuration = (pageNumber: number, seq: number) => {
    setPageSeq({
      playPage: pageNumber,
      sequnce: seq,
    })
  }

  /**
   * 오디오 볼륨 변경
   * @param volume
   */
  const changeVolume = (volume: number) => {
    const isMute = volume === 0

    player.muted = isMute
    player.volume = volume
  }

  const changePageNumber = (pageNumber: number) => {
    if (pageNumber === 1) {
      setPlayState('')
    }

    setPageNumber(pageNumber)
  }

  const changeAutoNextPage = (isAuto: boolean) => {
    isAutoRef.current = isAuto
  }

  return {
    isAutoRef,
    pageNumber,
    playState,
    pageSeq,
    currentTime,
    readCnt,
    playAudio,
    stopAudio,
    pauseAudio,
    pauseAudioByWord,
    resumeAudio,
    changePlaySpeed,
    changeDuration,
    changeVolume,
    changePageNumber,
    changeAutoNextPage,
  }
}

export { useStoryAudioMobile }
