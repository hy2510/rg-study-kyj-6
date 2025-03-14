import { useContext, useState } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useTranslation } from 'react-i18next'

import sideMenuCSS from '@stylesheets/side-menu.module.scss'

import { IScoreBoardData } from '@interfaces/Common'

type StudySideMenuProps = {
  isSideOpen: boolean
  currentStep: number | string
  currentStepType: string
  quizLength: number
  maxAnswerCount: number
  scoreBoardData: IScoreBoardData[]
  changeSideMenu: (state: boolean) => void
  changeStep: (step: number) => void
}

import icon_repeat from '@assets/images/story/repeat.svg'
import icon_delete from '@assets/images/story/delete.svg'
import icon_exit from '@assets/images/story/exite.svg'

import SideMenuScoreBoard from './side-menu/SideMenuScoreBoard'

export default function StudySideMenu({
  isSideOpen,
  currentStep,
  currentStepType,
  quizLength,
  maxAnswerCount,
  scoreBoardData,
  changeSideMenu,
  changeStep,
}: StudySideMenuProps) {
  const { t } = useTranslation()
  const { bookInfo, handler } = useContext(AppContext) as AppContextProps

  const [sideAnim, setSideAnim] = useState<
    'animate__fadeIn' | 'animate__fadeOut'
  >('animate__fadeIn')
  const [containerAnim, setContainerAnim] = useState<
    'animate__slideInRight' | 'animate__slideOutRight'
  >('animate__slideInRight')

  const closeMenu = () => {
    setSideAnim('animate__fadeOut')
    setContainerAnim('animate__slideOutRight')
  }

  const onAnimationEndHandler = () => {
    if (sideAnim === 'animate__fadeOut') {
      changeSideMenu(false)
    }
  }

  let localBottomPopupVolume = 70

  if (
    typeof localStorage.getItem('bottomPopupVolume') !== undefined &&
    localStorage.getItem('bottomPopupVolume')
  ) {
    localBottomPopupVolume = Number(localStorage.getItem('bottomPopupVolume'))
  }
  const [bottomPopupVolume, setBottomPopupVolume] = useState(
    localBottomPopupVolume,
  )

  return (
    <>
      {isSideOpen && (
        <div
          id="study-side-menu"
          className={`${sideMenuCSS.study_side_menu} ${sideAnim}`}
          onAnimationEnd={() => {
            onAnimationEndHandler()
          }}
        >
          <div
            id="study-side-menu-container"
            className={`${sideMenuCSS.study_side_menu_container} ${containerAnim}`}
          >
            <div className={sideMenuCSS.study_side_menu_area_top}>
              <div className={sideMenuCSS.close_side_menu}>
                <div
                  className={sideMenuCSS.btn_delete}
                  onClick={() => {
                    closeMenu()
                  }}
                >
                  <img src={icon_delete} alt="" />
                </div>
              </div>

              <div className={sideMenuCSS.book_info}>
                <div className={sideMenuCSS.book_code}>{bookInfo.BookCode}</div>
                <div className={sideMenuCSS.book_title}>{bookInfo.Title}</div>
              </div>

              {bookInfo.BookCode.includes('EB') && (
                <div className={sideMenuCSS.select_study_menu}>
                  <div
                    className={`${sideMenuCSS.select_study_menu_item}`}
                    onClick={() => {
                      handler.changeView('story')
                    }}
                  >
                    <img src={icon_repeat} alt="" />
                    {t('story.다시 읽기')}
                    <div className="pyro">
                      <div className="before"></div>
                      <div className="after"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* 보고있는 화면이 퀴즈인 경우 */}
              <SideMenuScoreBoard
                currentStep={currentStep}
                currentStepType={currentStepType}
                quizLength={quizLength}
                maxAnswerCount={maxAnswerCount}
                scoreBoardData={scoreBoardData}
                changeStep={changeStep}
              />
            </div>
            <div className={sideMenuCSS.study_side_menu_area_bottom}>
              <div className={sideMenuCSS.wrapper_correct_sound}>
                <div className="txt">Correct Sound</div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  onChange={(e) => {
                    setBottomPopupVolume(Number(e.currentTarget.value))
                    localStorage.setItem(
                      'bottomPopupVolume',
                      e.currentTarget.value,
                    )
                  }}
                  value={bottomPopupVolume}
                />
              </div>
              <div
                className={sideMenuCSS.btn_exit}
                onClick={() => {
                  try {
                    window.onExitStudy()
                  } catch (e) {
                    location.replace('/')
                  }
                }}
              >
                <img src={icon_exit} alt="" />
                <div className="txt">{t('common.나가기')}</div>
              </div>
            </div>
          </div>
          <div
            className={sideMenuCSS.screen_block}
            onClick={() => closeMenu()}
          ></div>
        </div>
      )}
    </>
  )
}
