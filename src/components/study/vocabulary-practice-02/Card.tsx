import vocabularyCSS from '@stylesheets/vocabulary-practice.module.scss'
import vocabularyCSSMobile from '@stylesheets/mobile/vocabulary-practice.module.scss'

import { LottieRecordAni } from '@components/common/LottieAnims'
import { useMicrophonePermissionChecker } from '@hooks/speak/useMicrophonePermissionChecker'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { IVocabulary2Quiz } from '@interfaces/IVocabulary'
import {
  MultiPlayStateProps,
  PlayBarState,
} from '@pages/study/VocabularyPractice2'
import { IPhonemeResult } from '@interfaces/ISpeak'

import BtnPlayWord from './BtnPlayWord'
import BtnPlaySentence from './BtnPlaySentence'
import ResultSpeak from './ResultSpeak'

type CardProps = {
  isSpeakResult: boolean
  playBarState: PlayBarState
  cardInfo: IVocabulary2Quiz
  multiPlayState: MultiPlayStateProps
  phonemeScore: IPhonemeResult | undefined
  playWord: () => void
  startRecord: () => void
  playSentence: () => void
  changePlayBarState: (state: PlayBarState) => void
}

const style = isMobile ? vocabularyCSSMobile : vocabularyCSS

export default function Card({
  isSpeakResult,
  playBarState,
  cardInfo,
  multiPlayState,
  phonemeScore,
  playWord,
  startRecord,
  playSentence,
  changePlayBarState,
}: CardProps) {
  const micCheck = useMicrophonePermissionChecker()

  return (
    <>
      <div
        className={`${style.wordCard} animate__animated animate__slideInRight`}
      >
        <div className={style.wordImage}>
          <img src={cardInfo.Question.Image} width={'100%'} />
        </div>

        {/* 녹음중일 때 스크린 블록 실행 */}
        {playBarState === 'recording' && !isSpeakResult && (
          <div className={style.screenBlock}></div>
        )}

        {/* 단어 */}
        <div className={`${style.wordText} ${style.word}`}>
          <BtnPlayWord
            multiPlayState={multiPlayState}
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

        {/* 뜻 */}
        <div className={style.wordText}>
          <BtnPlaySentence
            multiPlayState={multiPlayState}
            cardInfo={cardInfo}
            playSentence={playSentence}
          />
        </div>
      </div>

      {/* 스피크 결과 */}
      {isSpeakResult && (
        <ResultSpeak
          word={cardInfo.Question.Word}
          phonemeScore={phonemeScore}
          changePlayBarState={changePlayBarState}
        />
      )}
    </>
  )
}
