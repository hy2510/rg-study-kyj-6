import readingComprehensionCSS from '@stylesheets/reading-comprehension.module.scss'
import readingComprehensionCSSMobile from '@stylesheets/mobile/reading-comprehension.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type ImgQuestionProps = {
  src: string
}

const style = isMobile ? readingComprehensionCSSMobile : readingComprehensionCSS

export default function ImgQuestion({ src }: ImgQuestionProps) {
  return (
    <div className={style.questionImage}>
      <img
        src={src}
        width={isMobile ? 'auto' : '100%'}
        height={isMobile ? '100%' : 'auto'}
      />
    </div>
  )
}
