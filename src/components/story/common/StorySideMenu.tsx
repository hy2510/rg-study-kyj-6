import { useContext, useEffect, useState } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useTranslation } from 'react-i18next'

import sideMenuCSS from '@stylesheets/side-menu.module.scss'

type StorySideMenuProps = {
  isSideOpen: boolean
  changeSideMenu: (state: boolean) => void
  changeRatingShow: (state: boolean) => void
  toggleMovieShow: (isShow: boolean) => void
  submitBookMark: () => void
}

import icon_book from '@assets/images/story/book.svg'
import icon_repeat from '@assets/images/story/repeat.svg'
import icon_quiz from '@assets/images/story/check_board.svg'
import icon_delete from '@assets/images/story/delete.svg'
import icon_speak from '@assets/images/story/rec.svg'
import icon_exit from '@assets/images/story/exite.svg'
import icon_movie from '@assets/images/story/movie_book.svg'

export default function StorySideMenu({
  isSideOpen,
  changeSideMenu,
  changeRatingShow,
  toggleMovieShow,
  submitBookMark,
}: StorySideMenuProps) {
  const { t } = useTranslation()
  const { studyInfo, bookInfo, handler } = useContext(
    AppContext,
  ) as AppContextProps

  const [sideAnim, setSideAnim] = useState<
    'animate__fadeIn' | 'animate__fadeOut'
  >('animate__fadeIn')
  const [containerAnim, setContainerAnim] = useState<
    'animate__slideInRight' | 'animate__slideOutRight'
  >()

  useEffect(() => {
    setSideAnim('animate__fadeIn')
    setContainerAnim('animate__slideInRight')
  }, [isSideOpen])

  const closeHeader = () => {
    setSideAnim('animate__fadeOut')
    setContainerAnim('animate__slideOutRight')

    setTimeout(() => {
      changeSideMenu(false)
    }, 300)
  }

  return (
    <>
      {isSideOpen && (
        <div
          className={`${sideMenuCSS.study_side_menu} animate__animated ${sideAnim}`}
        >
          <div
            className={`${sideMenuCSS.study_side_menu_container} animate__animated ${containerAnim}`}
          >
            <div className={sideMenuCSS.study_side_menu_area_top}>
              <div className={sideMenuCSS.close_side_menu}>
                <div
                  className={sideMenuCSS.btn_delete}
                  onClick={() => {
                    closeHeader()
                  }}
                >
                  <img src={icon_delete} alt="" />
                </div>
              </div>
              <div className={sideMenuCSS.book_info}>
                <div className={sideMenuCSS.book_code}>{bookInfo.BookCode}</div>
                <div className={sideMenuCSS.book_title}>{bookInfo.Title}</div>
              </div>

              {/* 늘봄 사전 학습이 아닌 경우에만 보여주기 */}
              {studyInfo.mode !== 'preview' && (
                <>
                  <div className={sideMenuCSS.select_study_menu}>
                    <div
                      className={`${sideMenuCSS.select_study_menu_item} ${sideMenuCSS.go_on} `}
                      onClick={() => {
                        if (studyInfo.availableQuizStatus === 0) {
                          if (handler.isPreference) {
                            handler.changeView('quiz')
                          } else {
                            if (
                              handler.isReadingComplete ||
                              handler.storyMode === 'Story'
                            ) {
                              if (
                                bookInfo.FirstFullEasyCode === '093006' &&
                                bookInfo.FullEasyCode === '093003'
                              ) {
                                // 처음에 easy모드 후 full 모드로 학습 진입시 팝업창 안띄움
                                handler.changeView('quiz')
                              } else {
                                // 책을 끝까지 읽었거나 story모드인 경우
                                changeSideMenu(false)
                                changeRatingShow(true)
                              }
                            } else {
                              // 책을 끝까지 읽지 않았으면
                              alert(
                                t(
                                  'story.책을 완독한 후 학습을 진행할 수 있습니다.',
                                ),
                              )
                            }
                          }
                        } else if (studyInfo.availableQuizStatus === 1) {
                          alert(t('common.ReTest 정책으로 당일 재학습 불가'))
                        } else if (studyInfo.availableQuizStatus === 2) {
                          alert(t('common.일일 획득 가능 포인트 초과'))
                        }
                      }}
                    >
                      <img src={icon_quiz} alt="" />
                      {t('story.퀴즈 풀기')}
                    </div>
                  </div>

                  {/* 보너스 학습 */}
                  {(bookInfo.AnimationPath !== '' ||
                    studyInfo.isAvailableSpeaking) && (
                    <div className={sideMenuCSS.label}>
                      {t('story.보너스 학습')}
                    </div>
                  )}

                  <div className={sideMenuCSS.ebook_more_activity}>
                    {/* 무비북 */}
                    {bookInfo.AnimationPath !== '' && (
                      <>
                        <div
                          className={sideMenuCSS.ebook_more_activity_item}
                          onClick={() => {
                            changeSideMenu(false)
                            toggleMovieShow(true)
                          }}
                        >
                          <img src={icon_movie} alt="" />
                          {t('story.무비 시청')}
                        </div>
                      </>
                    )}

                    {/* Speaking */}
                    {studyInfo.isAvailableSpeaking && (
                      <>
                        <div
                          className={sideMenuCSS.ebook_more_activity_item}
                          onClick={() => {
                            handler.changeView('speaking')
                          }}
                        >
                          <img src={icon_speak} alt="" />
                          SPEAK ({t('story.말하기 연습')})
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* 나가기 */}
            <div className={sideMenuCSS.study_side_menu_area_bottom}>
              <div
                className={sideMenuCSS.btn_exit}
                onClick={() => submitBookMark()}
              >
                <img src={icon_exit} alt="" />
                <div className="txt">{t('common.나가기')}</div>
              </div>
            </div>
          </div>

          <div
            className={sideMenuCSS.screen_block}
            onClick={() => closeHeader()}
          ></div>
        </div>
      )}
    </>
  )
}
