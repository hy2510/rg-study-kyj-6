import vocabularyCSS from '@stylesheets/vocabulary-test.module.scss'
import vocabularyCSSMobile from '@stylesheets/mobile/vocabulary-test.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { PlayState } from '@hooks/study/useStudyAudio'

import BtnPlayWord from './BtnPlayWord'

type BtnHintProps = {
  isHint: boolean
  playState: PlayState
  remainCount: number | undefined
  totalCount: number | undefined
  toggleHint: () => void
  playHint: () => void
}

const style = isMobile ? vocabularyCSSMobile : vocabularyCSS

export default function BtnHint({
  isHint,
  playState,
  remainCount,
  totalCount,
  toggleHint,
  playHint,
}: BtnHintProps) {
  return (
    <div style={{ position: 'relative' }}>
      <div className={style.hintButton} onClick={() => toggleHint()}>
        <span>
          Hint{' '}
          {totalCount !== undefined && remainCount !== undefined
            ? totalCount - remainCount
            : 0}
          /{totalCount}
        </span>
      </div>

      {isHint && (
        <div
          style={{ position: 'relative', zIndex: 3 }}
          className="animate__animated animate__fadeIn"
        >
          <div className={style.hintPopup}>
            <BtnPlayWord playState={playState} playHint={playHint} />
          </div>
          <div className={style.screenBlock} onClick={() => toggleHint()}></div>
        </div>
      )}
    </div>
  )
}
