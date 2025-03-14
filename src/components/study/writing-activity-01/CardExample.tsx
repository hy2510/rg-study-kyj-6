import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { IWritingActivity1Example } from '@interfaces/IWritingActivity'

type CardExampleProps = {
  exampleRefs: React.MutableRefObject<HTMLDivElement[]>
  index: number
  example: IWritingActivity1Example
  selectWord: (index: number, selectedWord: string) => void
}

const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

export default function CardExample({
  exampleRefs,
  index,
  example,
  selectWord,
}: CardExampleProps) {
  return (
    <div
      ref={(el: HTMLDivElement) => (exampleRefs.current[index] = el)}
      className={`${style.textCard}`}
      onClick={() => selectWord(index, example.Text)}
    >
      <div className={style.awnserText}>{example.Text}</div>
    </div>
  )
}
