import popupCSS from '@stylesheets/study-popup-bottom.module.scss'
import popupCSSMobile from '@stylesheets/mobile/study-popup-bottom.module.scss'

import useCharacter from '@hooks/study/useCharacter'
import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { BottomPopupStateProps } from '@hooks/study/useBottomPopup'

type StudyPopupBottomProp = {
  bottomPopupState: BottomPopupStateProps
}

const style = isMobile ? popupCSSMobile : popupCSS

export default function StudyPopupBottom({
  bottomPopupState,
}: StudyPopupBottomProp) {
  const CHARACTER = useCharacter()

  return (
    <>
      {bottomPopupState.isActive && (
        <>
          <div
            className={`${
              bottomPopupState.isCorrect
                ? style.correctPopup
                : style.incorrectPopup
            }  animate__animated animate__slideInUp`}
          >
            <div className={style.readingUnitArea}>
              <div className={style.txtL}>
                {bottomPopupState.isCorrect ? 'Correct!' : 'Oops...'}
              </div>
              <img
                src={`https://wcfresource.a1edu.com/newsystem/image/character/subcharacter/${CHARACTER}_${
                  bottomPopupState.isCorrect ? '08' : '09'
                }.png`}
                alt=""
                className={`animate__animated ${
                  bottomPopupState.isCorrect
                    ? 'animate__tada'
                    : 'animate__pulse'
                }`}
              />
            </div>
          </div>
          <div className={style.screenBlock}></div>
        </>
      )}
    </>
  )
}
