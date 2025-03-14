import listeningCSS from '@stylesheets/listening-activity.module.scss'
import listeningCSSMobile from '@stylesheets/mobile/listening-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type ImgQuestionProps = {
  src: string
}

const style = isMobile ? listeningCSSMobile : listeningCSS

export default function ImgQuestion({ src }: ImgQuestionProps) {
  return (
    <div className={style.questionBox}>
      <img
        src={src}
        width={isMobile ? 'auto' : '250px'}
        height={isMobile ? '100%' : 'auto'}
      />
    </div>
  )
}
