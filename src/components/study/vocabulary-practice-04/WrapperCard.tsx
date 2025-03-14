import vocabularyCSS from '@stylesheets/vocabulary-practice.module.scss'
import vocabularyCSSMobile from '@stylesheets/mobile/vocabulary-practice.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { LottieRecordAni } from '@components/common/LottieAnims'
import { useMicrophonePermissionChecker } from '@hooks/speak/useMicrophonePermissionChecker'

import { IVocabulary4Practice } from '@interfaces/IVocabulary'

import { PlayState } from '@hooks/study/useStudyAudio'
import { PlayBarState } from '@pages/study/VocabularyPractice4'

type WrapperCardProps = {
  playState: PlayState
  playBarState: PlayBarState
  quizData: IVocabulary4Practice
  quizNo: number
  playWord: () => void
  startRecord: () => void
}

import BtnPlayWord from './BtnPlayWord'
import Gap from '../common-study/Gap'
import Mean from './Mean'

const style = isMobile ? vocabularyCSSMobile : vocabularyCSS

export default function WrapperCard({
  playState,
  playBarState,
  quizData,
  quizNo,
  playWord,
  startRecord,
}: WrapperCardProps) {
  const micCheck = useMicrophonePermissionChecker()

  return (
    <div
      className={`${style.wordCard} animate__animated animate__slideInRight`}
    >
      <div className={style.wordText}>
        <BtnPlayWord
          playState={playState}
          word={quizData.Quiz[quizNo - 1].Question.Text}
          playWord={playWord}
        />
        <div
          className={style.btnRec}
          onClick={() => {
            if (micCheck.micPermission === 'denied') {
              alert(micCheck.alertMessage)
            } else {
              startRecord()
            }
          }}
        >
          {playBarState === 'recording' ? (
            <LottieRecordAni />
          ) : (
            <div className={style.recIcon}></div>
          )}
        </div>
      </div>

      <Gap height={10} />

      <Mean
        meanData={quizData.Quiz[quizNo - 1]}
        mainMeanLang={quizData.MainMeanLanguage}
        subMeanLang={quizData.SubMeanLanguage}
      />
    </div>
  )
}
