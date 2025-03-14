import readingComprehensionCSS from '@stylesheets/reading-comprehension.module.scss'
import readingComprehensionCSSMobile from '@stylesheets/mobile/reading-comprehension.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { PlayState } from '@hooks/study/useStudyAudio'
import { IcoPlay, IcoStop } from '@components/common/Icons'

type BtnPlayWordProps = {
  playState: PlayState
  question: string
  onPlay: () => void
}

const style = isMobile ? readingComprehensionCSSMobile : readingComprehensionCSS

export default function BtnPlayWord({
  playState,
  question,
  onPlay,
}: BtnPlayWordProps) {
  return (
    <div className={style.wordPlayButton} onClick={() => onPlay()}>
      {playState === '' ? (
        <IcoPlay isColor width={34} height={34} />
      ) : (
        <IcoStop isColor width={34} height={34} />
      )}
      <div className={style.txtL}>{question}</div>
    </div>
  )
}
