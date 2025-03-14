import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type CardWordProps = {
  text: { text: string; index: number }
  removeWord: (word: string, wordIndex: number) => void
}

const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

export default function CardWord({ text, removeWord }: CardWordProps) {
  return (
    <div
      className={`${style.textCard}`}
      onClick={() => removeWord(text.text, text.index)}
    >
      <div className={style.awnserText}>{text.text}</div>
    </div>
  )
}
