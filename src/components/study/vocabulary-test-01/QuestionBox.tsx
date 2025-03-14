import vocabularyCSS from '@stylesheets/vocabulary-test.module.scss'
import vocabularyCSSMobile from '@stylesheets/mobile/vocabulary-test.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type QuestionBoxProps = {
  img: string
}

const style = isMobile ? vocabularyCSSMobile : vocabularyCSS

export default function QuestionBox({ img }: QuestionBoxProps) {
  return (
    <div className={style.questionBox}>
      <div className={style.wordImage}>
        <img src={img} width={'100%'} />
      </div>
    </div>
  )
}
