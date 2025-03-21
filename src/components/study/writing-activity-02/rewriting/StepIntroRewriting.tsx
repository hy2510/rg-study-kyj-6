import stepIntroCSS from '@stylesheets/step-intro.module.scss'
import stepIntroCSSMobile from '@stylesheets/mobile/step-intro.module.scss'
import { useTranslation } from 'react-i18next'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type StepIntroRewritingProps = {
  currentSubmitCount: number
  maxSubmitCount: number
  goWritingActivity: () => void
}

const style = isMobile ? stepIntroCSSMobile : stepIntroCSS

export default function StepIntroRewriting({
  currentSubmitCount,
  maxSubmitCount,
  goWritingActivity,
}: StepIntroRewritingProps) {
  const { t } = useTranslation()

  return (
    <div className={style.revisionFreeIntro}>
      <div
        className={`${style.container} animate__animated animate__bounceInRight`}
      >
        <div className={style.stepOrder}>Step5</div>
        <div className={style.quizType}>Writing Activity(R)</div>
        <div className={style.comment}>{t('study.글쓰기를 하시겠어요?')}</div>
        <div className={style.revisionBoard}>
          <div className={style.txtLabel}>{t('study.남은 첨삭')}:</div>
          <div className={style.txtCount}>
            {maxSubmitCount - currentSubmitCount} / {maxSubmitCount}
          </div>
          <div className={style.txtLabel}>{t('study.첨삭 완료')}:</div>
          <div className={style.txtCount}>{currentSubmitCount}</div>
        </div>
        <div style={{ display: 'flex' }} className={style.selectBox}>
          <div className={style.goButton} onClick={() => goWritingActivity()}>
            Go
          </div>
        </div>
      </div>
    </div>
  )
}
