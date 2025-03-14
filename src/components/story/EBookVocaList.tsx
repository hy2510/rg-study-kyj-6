import { useContext, useEffect, useState } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'

import style from '@stylesheets/e-book.module.scss'

import { IStudyData } from '@interfaces/Common'
import { PlayState } from '@interfaces/IStory'
import {
  getVocabularyPractice1,
  getVocabularyPractice2,
  getVocabularyPractice3,
  getVocabularyPractice4,
} from '@services/quiz/VocabularyAPI'
import {
  IVocabulary1Practice,
  IVocabulary2Practice,
  IVocabulary3Practice,
  IVocabulary4Practice,
} from '@interfaces/IVocabulary'
import VocaList1 from './VocaList1'
import VocaList2 from './VocaList2'
import VocaList3 from './VocaList3'
import VocaList4 from './VocaList4'

type EbookVocaListProps = {
  playState: PlayState
  pauseStoryAudio: () => void
  resumeStoryAudio: () => void
}

export const EbookVocaList = ({
  playState,
  pauseStoryAudio,
  resumeStoryAudio,
}: EbookVocaListProps) => {
  const { studyInfo } = useContext(AppContext) as AppContextProps
  const [vocaData1, setVocaData1] = useState<IVocabulary1Practice>()
  const [vocaData2, setVocaData2] = useState<IVocabulary2Practice>()
  const [vocaData3, setVocaData3] = useState<IVocabulary3Practice>()
  const [vocaData4, setVocaData4] = useState<IVocabulary4Practice>()

  useEffect(() => {
    const getVocaData = async () => {
      const datas: IStudyData = {
        mode: studyInfo.mode,
        currentStep: 2,
        studyId: studyInfo.studyId,
        studentHistoryId: studyInfo.studentHistoryId,
        bookType: studyInfo.bookType,
        studyTypeCode: studyInfo.bookType === 'EB' ? '001006' : '001001',
        isEnabledPractice: studyInfo.isPassedVocabularyPractice,
        theme: 'theme-antarctica',
        lastStep: studyInfo.allSteps[studyInfo.allSteps.length - 1],
        isReTestYn: studyInfo.isReTestYn,
        onFinishActivity: () => {},
        changeVocaState: () => {},
        changeStep: (step: number) => {},
      }

      switch (studyInfo.mappedStepActivity[1]) {
        case 'Vocabulary1':
          setVocaData1(await getVocabularyPractice1(datas))
          break
        case 'Vocabulary2':
          setVocaData2(await getVocabularyPractice2(datas))
          break
        case 'Vocabulary3':
          setVocaData3(await getVocabularyPractice3(datas))
          break
        case 'Vocabulary4':
          setVocaData4(await getVocabularyPractice4(datas))
          break
      }
    }

    if (!vocaData1 && !vocaData2 && !vocaData3 && !vocaData4) getVocaData()
  }, [])

  if (!vocaData1 && !vocaData2 && !vocaData3 && !vocaData4) <>Loading</>

  return (
    <div className={style.ebook_voca_list}>
      {vocaData1 &&
        vocaData1.Quiz.map((data) => {
          return (
            <VocaList1
              vocaData={data}
              mainLang={vocaData1.MainMeanLanguage}
              playState={playState}
              pauseStoryAudio={pauseStoryAudio}
              resumeStoryAudio={resumeStoryAudio}
            />
          )
        })}

      {vocaData2 &&
        vocaData2.Quiz.map((data) => {
          return (
            <VocaList2
              vocaData={data}
              mainLang={vocaData2.MainMeanLanguage}
              playState={playState}
              pauseStoryAudio={pauseStoryAudio}
              resumeStoryAudio={resumeStoryAudio}
            />
          )
        })}

      {vocaData3 &&
        vocaData3.Quiz.map((data) => {
          return (
            <VocaList3
              vocaData={data}
              mainLang={vocaData3.MainMeanLanguage}
              playState={playState}
              pauseStoryAudio={pauseStoryAudio}
              resumeStoryAudio={resumeStoryAudio}
            />
          )
        })}

      {vocaData4 &&
        vocaData4.Quiz.map((data) => {
          return (
            <VocaList4
              vocaData={data}
              mainLang={vocaData4.MainMeanLanguage}
              playState={playState}
              pauseStoryAudio={pauseStoryAudio}
              resumeStoryAudio={resumeStoryAudio}
            />
          )
        })}
    </div>
  )
}
