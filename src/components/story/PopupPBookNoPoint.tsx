import { useContext } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useTranslation, Trans } from 'react-i18next'

import EBCSS from '@stylesheets/e-book.module.scss'

export default function PopupPBookNoPoint() {
  const { t } = useTranslation()
  const { bookInfo, handler, studyInfo } = useContext(
    AppContext,
  ) as AppContextProps

  return (
    <div className={`${EBCSS.ebookRating}`}>
      <div className={`${EBCSS.container} animate__animated animate__zoomIn`}>
        <div className={EBCSS.groupBookcover}>
          <img
            className={EBCSS.imgBookcover}
            src={`${bookInfo.SurfaceImage}`}
          />
        </div>

        {studyInfo.pbookStorySoundPath !== '' &&
          studyInfo.pbookStorySoundPath !== undefined && (
            <>
              {' '}
              <div className={EBCSS.wrapperSound}>
                <audio
                  src={studyInfo.pbookStorySoundPath}
                  controls
                  controlsList={'nodownload'}
                ></audio>
              </div>
            </>
          )}

        <div className={EBCSS.groupComment}>
          <span className={EBCSS.txtComment}>
            <div>{t('story.이미 두 번 포인트를 획득한 학습입니다.')}</div>

            <div>
              <Trans
                i18nKey="story.더 이상 포인트를 획득할 수 없습니다."
                components={{ b: <b /> }}
              />
            </div>

            <div>{t('story.계속 학습하시겠습니까?')}</div>
          </span>
        </div>

        <div className={EBCSS.groupChoose}>
          <div className={EBCSS.groupConfirm}>
            <button
              className={`${EBCSS.btnConfirm} ${EBCSS.blue}`}
              onClick={() => {
                handler.changeView('quiz')
              }}
            >
              {t('common.네')}
            </button>
            <button
              className={`${EBCSS.btnConfirm} ${EBCSS.gray}`}
              onClick={() => {
                try {
                  window.onExitStudy()
                } catch (e) {
                  location.replace('/')
                }
              }}
            >
              {t('common.아니오')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
