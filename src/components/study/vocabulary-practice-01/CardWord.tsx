import vocabularyCSS from '@stylesheets/vocabulary-practice.module.scss'
import vocabularyCSSMobile from '@stylesheets/mobile/vocabulary-practice.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { LottieRecordAni } from '@components/common/LottieAnims'
import { useMicrophonePermissionChecker } from '@hooks/speak/useMicrophonePermissionChecker'

import { PlayState } from '@hooks/study/useStudyAudio'
import { PlayBarState } from '@pages/study/VocabularyPractice1'
import { IVocabulary1Quiz } from '@interfaces/IVocabulary'
import { IPhonemeResult } from '@interfaces/ISpeak'

import BtnPlayWord from './BtnPlayWord'
import ResultSpeak from './ResultSpeak'

type CardWordProps = {
  isSpeakResult: boolean
  playState: PlayState
  playBarState: PlayBarState
  cardInfo: IVocabulary1Quiz
  phonemeScore: IPhonemeResult | undefined
  playWord: () => void
  startRecord: () => void
  changePlayBarState: (state: PlayBarState) => void
}

const style = isMobile ? vocabularyCSSMobile : vocabularyCSS

export default function CardWord({
  isSpeakResult,
  playState,
  playBarState,
  cardInfo,
  phonemeScore,
  playWord,
  startRecord,
  changePlayBarState,
}: CardWordProps) {
  const micCheck = useMicrophonePermissionChecker()

  return (
    <>
      <div className={`${style.wordCard} animate__animated`}>
        <div className={style.wordImage}>
          <img src={cardInfo.Question.Image} width={'100%'} />
        </div>

        {/* 녹음중일 때 스크린 블록 실행 */}
        {playBarState === 'recording' && !isSpeakResult && (
          <div className={style.screenBlock}></div>
        )}

        <div className={style.wordText}>
          <BtnPlayWord
            playState={playState}
            cardInfo={cardInfo}
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
      </div>

      {/* 스피크 결과 */}
      {isSpeakResult && (
        <ResultSpeak
          word={cardInfo.Question.Text}
          phonemeScore={phonemeScore}
          changePlayBarState={changePlayBarState}
        />
      )}
    </>
  )
}
