import vocabularyCSS from '@stylesheets/vocabulary-test.module.scss'
import vocabularyCSSMobile from '@stylesheets/mobile/vocabulary-test.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type WrapperQuestionProps = {
  src: string
  sentence: string
  blankWord: string
}

const style = isMobile ? vocabularyCSSMobile : vocabularyCSS

export default function WrapperQuestion({
  src,
  sentence,
  blankWord,
}: WrapperQuestionProps) {
  let underBar = ''

  for (let i = 0; i < blankWord.length; i++) {
    underBar += '_'
  }

  return (
    <div className={style.questionBox}>
      <div className={style.wordImage}>
        <img src={src} width={'100%'} />
      </div>
      <div className={style.wordText}>
        {sentence.split(blankWord)[0]} {underBar}
        {sentence.split(blankWord)[1]}
      </div>
    </div>
  )
}
