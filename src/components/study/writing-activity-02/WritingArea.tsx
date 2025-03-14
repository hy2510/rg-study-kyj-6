import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type WritingAreaProps = {
  wordMinCount: number
  wordMaxCount: number
  answerData: string
  onChangeHandler: (text?: string) => void
}

const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

export default function WritingArea({
  wordMinCount,
  wordMaxCount,
  answerData,
  onChangeHandler,
}: WritingAreaProps) {
  return (
    <div className={style.writingArea}>
      <textarea
        placeholder={`Please fill out within ${wordMinCount} to ${wordMaxCount} characters.`}
        value={answerData}
        onChange={(e) => onChangeHandler(e.currentTarget.value)}
      />
    </div>
  )
}
