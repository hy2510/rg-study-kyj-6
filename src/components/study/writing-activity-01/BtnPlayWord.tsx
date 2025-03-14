import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { PlayState } from '@hooks/study/useStudyAudio'
import { IcoPlay, IcoStop } from '@components/common/Icons'

type BtnPlayWordProps = {
  playState: PlayState
  onPlay: () => void
}

const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

export default function BtnPlayWord({ playState, onPlay }: BtnPlayWordProps) {
  return (
    <div className={style.wordPlayButton} onClick={() => onPlay()}>
      {playState === '' ? (
        <IcoPlay isColor width={34} height={34} />
      ) : (
        <IcoStop isColor width={34} height={34} />
      )}
      <span className={style.txtL}>Play Sound</span>
    </div>
  )
}
