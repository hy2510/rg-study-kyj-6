import summaryCSS from '@stylesheets/summary.module.scss'
import summaryCSSMobile from '@stylesheets/mobile/summary.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type TrueSentenceProps = {
  sentence: string
  playSentence: () => void
  goNextQuiz: () => void
}

const style = isMobile ? summaryCSSMobile : summaryCSS

export default function TrueSentence({
  sentence,
  goNextQuiz,
}: TrueSentenceProps) {
  return (
    <div className={style.trueSentencePopup}>
      <div className={style.title}>True Sentence</div>
      <div className={style.container}>
        <div className={style.sentence}>{sentence}</div>
      </div>
      <div className={style.nextButton} onClick={() => goNextQuiz()}>
        Next
      </div>
    </div>
  )
}
