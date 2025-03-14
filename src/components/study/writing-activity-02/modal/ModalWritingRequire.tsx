import stepIntroCSS from '@stylesheets/step-intro.module.scss'
import stepIntroCSSMobile from '@stylesheets/mobile/step-intro.module.scss'
import { useTranslation } from 'react-i18next'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type ModalWritingRequireProps = {
  unit: string
  goWritingActivity: () => void
}

const style = isMobile ? stepIntroCSSMobile : stepIntroCSS

export default function ModalWritingRequire({
  unit,
  goWritingActivity,
}: ModalWritingRequireProps) {
  const { t } = useTranslation()

  return (
    <div className={style.stepIntro}>
      <div
        className={`${style.container} animate__animated animate__bounceInRight`}
      >
        <div className={style.stepOrder}>Step5</div>
        <div className={style.quizType}>Writing Activity</div>
        <div className={style.comment}>
          {t('study.글쓰기 후 첨삭을 받으세요.')}
        </div>

        <div className={style.readingUnit}>
          <img
            src={`https://wcfresource.a1edu.com/newsystem/image/character/subcharacter/${unit}_13.png`}
            alt=""
          />
        </div>
        <div className={style.startButton} onClick={() => goWritingActivity()}>
          Start
        </div>
      </div>
    </div>
  )
}
