import { useContext, useEffect } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'

import MobileDetect from 'mobile-detect'
import { playAudio } from '@utils/common'

import SpeakCSS from '@stylesheets/speak.module.scss'

import {
  LottieExcellentAni,
  LottieGoodEffortAni,
} from '@components/common/LottieAnims'

import SndExellent from '@assets/sounds/good_job.mp3'
import SndGoodEffort from '@assets/sounds/good_effort.mp3'

const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type ResultSpeakProps = {
  isPass: boolean
}

export default function ResultSpeak({ isPass }: ResultSpeakProps) {
  const { handler, bookInfo } = useContext(AppContext) as AppContextProps

  useEffect(() => {
    if (isPass) {
      playAudio(SndExellent)
    } else {
      playAudio(SndGoodEffort)
    }
  }, [])

  return (
    <div
      className={`${SpeakCSS.wrapperResult} ${isMobile ? 'mobile' : ''}`}
      style={{ backgroundImage: `url(${bookInfo.BackgroundImage})` }}
    >
      <div className={SpeakCSS.resultMark}>
        {isPass ? (
          <>
            <LottieExcellentAni
              width={isMobile ? 300 : 450}
              height={isMobile ? 300 : 450}
            />
            <div className={SpeakCSS.txt}>Good Job!</div>
          </>
        ) : (
          <>
            <LottieGoodEffortAni
              width={isMobile ? 320 : 500}
              height={isMobile ? 160 : 350}
            />
            <div className={SpeakCSS.txt}>Good Effort</div>
          </>
        )}

        <button
          className={`${SpeakCSS.btnExitResult} ${isMobile ? 'mobile' : ''}`}
          onClick={() => {
            handler.changeView('story')
          }}
        />
      </div>
    </div>
  )
}
