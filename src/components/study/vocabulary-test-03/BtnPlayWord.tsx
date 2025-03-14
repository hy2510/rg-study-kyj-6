import vocabularyCSS from '@stylesheets/vocabulary-test.module.scss'
import vocabularyCSSMobile from '@stylesheets/mobile/vocabulary-test.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { PlayState } from '@hooks/study/useStudyAudio'

import { IcoPlay, IcoStop } from '@components/common/Icons'

type BtnPlayWordProps = {
  playState: PlayState
  playHint: () => void
}

const style = isMobile ? vocabularyCSSMobile : vocabularyCSS

export default function BtnPlayWord({ playState, playHint }: BtnPlayWordProps) {
  return (
    <div className={style.wordPlayButton} onClick={() => playHint()}>
      {playState === 'playing' ? (
        <IcoStop isColor width={40} height={40} />
      ) : (
        <IcoPlay isColor width={40} height={40} />
      )}
      <span className={style.txtL}>Play Sound</span>
    </div>
  )
}
