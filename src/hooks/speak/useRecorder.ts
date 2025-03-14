import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import axios from 'axios'
import { IRecordResultData } from '@interfaces/ISpeak'
import { PlayBarState } from '@pages/containers/SpeakContainer'

import { isIOS } from 'react-device-detect'
import { SAVE_STATISTICS_PATH } from '@constants/constant'

const API_URL = 'https://api.readinggate.elasolution.com'
const API_KEY = 'e874641aac784ff6b9d62c3483f7aaaa'

export default function useRecorder() {
  const { t } = useTranslation()
  const [userAudio, setUserAudio] = useState('')

  /**
   * 녹음 시작
   * @param text
   * @param changeSentenceScore
   */
  const startRecording = (
    studyId: string,
    studentHistoryId: string,
    bookCode: string,
    quizNo: number,
    tryCount: number,
    text: string,
    nativeAudio: string,
    changePlayBarState: (state: PlayBarState) => void,
    changeSentenceScore: (data: IRecordResultData) => void,
  ) => {
    try {
      const audio = new Audio(nativeAudio)

      // 오디오의 duration을 구한 뒤 녹음 시작
      const onRecordHandler = () => {
        const additionSec = audio.duration >= 5 ? 1.4 : 1.2
        const recordDuration = Math.ceil(audio.duration * 1000 * additionSec)

        if (navigator.mediaDevices.getUserMedia) {
          console.log('The mediaDevices.getUserMedia() method is supported.')

          // user media 권한 얻기 성공
          const onSuccGetUserMedia = (stream: MediaStream) => {
            changePlayBarState('recording')

            const recorder = new MediaRecorder(stream)
            const chunks: BlobPart[] | undefined = []

            recorder.ondataavailable = (event) => {
              chunks.push(event.data)
            }

            recorder.onstop = () => {
              stream.getTracks().forEach(function (track) {
                track.stop()
              })

              const audioBlob = new Blob(chunks, { type: recorder.mimeType })
              const studentAudio = new File([audioBlob], 'student_audio.mp3', {
                type: 'audio/mp3',
              })

              setUserAudio(URL.createObjectURL(audioBlob))

              pron_v2(
                studyId,
                studentHistoryId,
                bookCode,
                quizNo,
                tryCount,
                studentAudio,
                nativeAudio,
                text,
                changeSentenceScore,
              )
            }

            recorder.onerror = (e) => {
              alert(e)
            }

            recorder.start()

            setTimeout(() => {
              recorder.stop()
            }, recordDuration)
          }

          // user media 권한 얻기 실패
          const onFailGetUserMedia = (err: string) => {
            console.error('The following error occured: ' + err)
            changePlayBarState('reset')
          }

          const constraints = { audio: true }
          navigator.mediaDevices
            .getUserMedia(constraints)
            .then(onSuccGetUserMedia, onFailGetUserMedia)
            .catch((err) => {
              alert(
                '예기치 못한 오류가 발생했습니다. 리딩게이트로 연락주시길 바랍니다. 1599-0533',
              )

              window.onExitStudy()
            })
        } else {
          alert('MediaDevices.getUserMedia() not supported on your browser!')
          changePlayBarState('reset')
        }
      }

      if (isIOS) {
        audio.addEventListener('loadedmetadata', onRecordHandler)
      } else {
        audio.addEventListener('canplaythrough', onRecordHandler)
      }
    } catch (e) {
      alert(e)
    }
  }

  /**
   * 에듀템 테스트
   * @param audioBlob
   * @param text
   */
  const pron_v2 = async (
    studyId: string,
    studentHistoryId: string,
    bookCode: string,
    quizNo: number,
    tryCount: number,
    studentAudio: File,
    nativeAudio: string,
    text: string,
    changeSentenceScore: (score: IRecordResultData) => void,
  ) => {
    const nativeFile = await convertURLtoFile(nativeAudio)

    const formData = new FormData()
    formData.append('student_audio', studentAudio)
    formData.append('text', text)
    // @ts-ignore
    formData.append('get_phoneme_result', true)
    // @ts-ignore
    formData.append('native_audio', nativeFile)

    // 에듀템 평가가 너무 오래 걸릴 경우 얼럿창 띄워주기
    const popupSpeakLouder = () => {
      alert('Speak Louder!!!')
    }

    const lazyTimer = setTimeout(() => popupSpeakLouder(), 7000)
    // 에듀템 평가가 너무 오래 걸릴 경우 얼럿창 띄워주기 end

    axios
      .post(`${API_URL}/pron_v2/`, formData, {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((data) => {
        // Speak 데이터 로그 남기기
        try {
          axios.post(`/${SAVE_STATISTICS_PATH}`, {
            studyId: studyId,
            studentHistoryId: studentHistoryId,
            errorCode: data.status,
            bookCode: bookCode,
            libName: 'Speak',
            apiName: 'PRON_V2',
            quizNo: quizNo,
            sentence: text,
            tryCount: `${tryCount + 1}`,
            scorePhoneme: data.data.phoneme_result.sentence_score,
            scoreTotal: data.data.total_score,
          })
        } catch (e) {
          console.log('Error save statistics')
        }

        // 스피킹 결과
        switch (data.status) {
          case 200:
            // 정상적으로 완료된 경우
            changeSentenceScore(data.data)
            break

          case 401:
            // 인증키가 잘못된 경우
            alert(
              t(
                'study.인증키가 잘못되었습니다. 리딩게이트로 전화주세요. 1599-0533',
              ),
            )
            break

          case 403:
            // Forbidden
            alert(data.data)
            break

          case 422:
            // Validation Error
            alert(data.data)
            break
        }
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        clearTimeout(lazyTimer)
      })
  }

  return {
    userAudio,
    startRecording,
  }
}

export const convertURLtoFile = async (url: string) => {
  const response = await fetch(url)
  const data = await response.blob()
  const ext = url.split('.').pop() // url 구조에 맞게 수정할 것
  const filename = url.split('/').pop() // url 구조에 맞게 수정할 것
  const metadata = { type: `image/${ext}` }
  return new File([data], filename!, metadata)
}

export { useRecorder }
