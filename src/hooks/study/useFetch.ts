import { useEffect, useState } from 'react'
import { IRecordAnswerType, IStudyData, IUserData } from '@interfaces/Common'

import { loadRecordedData } from '@services/studyApi'
import { ISpeakRecord } from '@interfaces/ISpeak'
import { loadSpeakRecordData } from '@services/speakApi'

const useFetch = <T>(
  getData: (study: IStudyData) => Promise<T>,
  props: IStudyData,
  step: number | string,
  isReTestYn?: boolean,
): [T | undefined, IRecordAnswerType[]] => {
  const [quizData, setQuizData] = useState<T>()
  const [recordedData, setRecordedData] = useState<IRecordAnswerType[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const data = await getData(props)

      if (!data) throw new Error('No StudyData Error')

      let recordData

      if (isReTestYn) {
        recordData = await loadRecordedData('R', props)
      } else {
        recordData = await loadRecordedData(step, props)
      }

      setQuizData(data)
      setRecordedData(recordData)
    }

    fetchData()
  }, [getData])

  return [quizData, recordedData]
}

const useFetchSpeak = <T>(
  getData: (study: IUserData) => Promise<T>,
  props: IUserData,
  isReTestYn?: boolean,
): [T | undefined, ISpeakRecord[]] => {
  const [speakData, setSpeakData] = useState<T>()
  const [recordedData, setRecordedData] = useState<ISpeakRecord[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const data = await getData(props)

      if (!data) throw new Error('No StudyData Error')

      let recordData

      if (isReTestYn) {
        recordData = await loadSpeakRecordData(props)
      } else {
        recordData = await loadSpeakRecordData(props)
      }

      setSpeakData(data)
      setRecordedData(recordData)
    }

    fetchData()
  }, [getData])

  return [speakData, recordedData]
}

export { useFetch, useFetchSpeak }
