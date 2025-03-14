import '@stylesheets/character.scss'
import testResultCSS from '@stylesheets/test-result.module.scss'
import testResultCSSMobile from '@stylesheets/mobile/test-result.module.scss'

import useCharacter from '@hooks/study/useCharacter'
import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type CompleteFailProps = {
  average: number
}

const style = isMobile ? testResultCSSMobile : testResultCSS

export default function CompleteFail({ average }: CompleteFailProps) {
  const CHARACTER = useCharacter()

  return (
    <div className={style.quizEndingFail}>
      <div className={`${style.container} animate__animated animate__zoomIn`}>
        <div
          className={style.groupTryAgin}
          onClick={() => {
            location.replace('/uiz/library')
          }}
        >
          <div className={`${style.imgUnit} fail_${CHARACTER}`}></div>
          <div className={style.imgTryAgainRibbon}></div>
        </div>
        <div className={style.groupScore}>
          <span>{average}</span>
          <span>/</span>
          <span>100</span>
        </div>
        <div
          className={style.btnDelete}
          onClick={() => {
            location.replace('/uiz/library')
          }}
        ></div>
      </div>
    </div>
  )
}
