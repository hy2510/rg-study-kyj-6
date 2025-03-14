import {
  ISpeakRecord,
  ISpeakSaveResult,
  ISpeakUserAnswer,
  SpeakPageProps,
} from '@interfaces/ISpeak'
import { getQuizData } from './studyApi'
import { Mode } from '@interfaces/Types'
import axios from 'axios'
import {
  GET_SPEAK_DATA_PATH,
  GET_SPEAK_RECORD_PATH,
  SAVE_SPEAK_DATA_PATH,
} from '@constants/constant'
import { IUserData } from '@interfaces/Common'

type PropsType = {
  mode: Mode
  studyId: string
  studentHistoryId: string
}

/**
 * Speaking 데이터 가져오기
 * @param props
 * @returns Speaking 데이터
 */
async function getSpeakData(props: PropsType): Promise<SpeakPageProps[]> {
  const path = `${GET_SPEAK_DATA_PATH}?studentHistoryId=${props.studentHistoryId}&studyId=${props.studyId}`

  const transformObject = async (data: any): Promise<SpeakPageProps[]> => {
    return data.map((r: any) => {
      return {
        ChallengeNumber: r.ChallengeNumber,
        BookId: r.BookId,
        Page: r.Page,
        QuizNo: r.QuizNo,
        Css: r.Css,
        Contents: r.Contents,
        FontColor: r.FontColor,
        ImagePath: r.ImagePath,
        Sequence: r.Sequence,
        SoundPath: r.SoundPath,
        MarginTop: Number(r.MarginTop),
        MarginLeft: Number(r.MarginLeft),
        DataPath: r.DataPath,
        Sentence: r.Sentence,
      }
    })
  }

  return getQuizData<SpeakPageProps[]>(path, transformObject)
}

const loadSpeakRecordData = async (props: IUserData) => {
  const recordedData: ISpeakRecord[] = await axios
    .get(
      `/${GET_SPEAK_RECORD_PATH}?studyId=${props.studyId}&studentHistoryId=${props.studentHistoryId}`,
    )
    .then((res) => res.data)
    .catch((e) => {
      console.error(e)
    })

  return recordedData
}

const saveSpeakResult = async (
  userAnswer: ISpeakUserAnswer,
): Promise<ISpeakSaveResult> => {
  let result: ISpeakSaveResult = {
    result: 0,
    resultMessage: '',
  }

  try {
    result = await axios
      .post(`/${SAVE_SPEAK_DATA_PATH}`, userAnswer)
      .then((res) => res.data)
  } catch (e) {
    throw new Error('API Load Failed 2')
  }

  return result
}

export { getSpeakData, saveSpeakResult, loadSpeakRecordData }
