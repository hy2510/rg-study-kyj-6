import { useContext, useState, useEffect } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'

import MobileDetect from 'mobile-detect'

import { getStoryInfo, submitPreference } from '@services/storyApi'

import { PageProps } from '@interfaces/IStory'

import useStoryImagePreload from '@hooks/story/useImagePreload'

import '@stylesheets/fonts/font.scss'
import EBCSS from '@stylesheets/e-book.module.scss'

import StoryPC from '@pages/story/StoryPC'
import StoryMoblie from '@pages/story/StoryMobile'

import MovieBook from '@components/story/MovieBook'

import PopupEBookRating from '@components/story/PopupEBookRating'
import PopupEBookDecreasePoint from '@components/story/PopupEBookDecreasePoint'
import PopupEBookNoPoint from '@components/story/PopupEBookNoPoint'

const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone() || md.tablet() || window.innerWidth < 1370

export default function EBook() {
  const { bookInfo, studyInfo, handler } = useContext(
    AppContext,
  ) as AppContextProps
  const [storyData, setStoryData] = useState<PageProps[]>()
  const [isRatingShow, setRatingShow] = useState(false)
  const [isMovieShow, setMovieShow] = useState(false)

  // img preload
  const { imgSize, preloadImage } = useStoryImagePreload()

  // 화면 사이즈
  const [windowHeight, setWindowHeight] = useState(window.innerHeight)
  const [pageScale, setPageScale] = useState<number>(1)

  useEffect(() => {
    const getStoryData = async () => {
      const data = await getStoryInfo(
        studyInfo.studyId,
        studyInfo.studentHistoryId,
      )

      if (data) {
        setStoryData(data)
        preloadImage(data)
      }
    }

    if (!storyData) getStoryData()
  }, [storyData])

  // 창 크기가 변경되거나 가로/세로가 변경되는 등의 행위가 일어나면
  useEffect(() => {
    const resizeHandler = () => {
      if (isMobile) {
        setWindowHeight(window.innerHeight)
        setPageScale(screen.width / imgSize.width)
      } else {
        setWindowHeight(window.innerHeight)
        setPageScale((window.innerHeight / imgSize.height) * 0.9)
      }
    }

    resizeHandler()

    // resize시 넓이 / 높이 조절
    window.addEventListener('resize', resizeHandler)

    return () => {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [isMobile, imgSize, windowHeight])

  /**
   * 별점 주기
   * @param isShow
   */
  const changeRatingShow = (state: boolean) => {
    if (studyInfo.isNB) {
      doPreferenceNB()
    } else {
      setRatingShow(state)
    }
  }

  /**
   * 늘봄은 별점주기 없이 바로 다음으로 넘어감
   */
  const doPreferenceNB = async () => {
    const res = await submitPreference(
      studyInfo.studyId,
      studyInfo.studentHistoryId,
      5 * 10,
    )

    if (res.success) {
      handler.changeView('quiz')
    }
  }

  /**
   * movie book
   * @param isShow
   */
  const toggleMovieShow = (isShow: boolean) => {
    setMovieShow(isShow)
  }

  if (!storyData) return <>Loading...</>

  // 디폴트 화면
  return (
    <>
      {/* 배경 이미지는 해당 eBook의 추천 도서에서 사용되는 배경 이미지가 나와야 함 */}
      <div
        className={EBCSS.ebook}
        style={{
          backgroundImage: `url('${bookInfo.BackgroundImage}')`,
          height: windowHeight,
        }}
      >
        {/* 웹인지 모바일인지 */}
        {!isMobile ? (
          <StoryPC
            isRatingShow={isRatingShow}
            isMovieShow={isMovieShow}
            storyData={storyData}
            imgSize={imgSize}
            pageScale={pageScale}
            changeRatingShow={changeRatingShow}
            toggleMovieShow={toggleMovieShow}
          />
        ) : (
          <StoryMoblie
            isRatingShow={isRatingShow}
            isMovieShow={isMovieShow}
            storyData={storyData}
            changeRatingShow={changeRatingShow}
            toggleMovieShow={toggleMovieShow}
          />
        )}
      </div>

      {/* rating */}
      {isRatingShow && bookInfo.PassCount === 0 && (
        <PopupEBookRating changeRatingShow={changeRatingShow} />
      )}

      {/* rating */}
      {isRatingShow && bookInfo.PassCount === 1 && <PopupEBookDecreasePoint />}

      {/* rating */}
      {isRatingShow && bookInfo.PassCount === 2 && <PopupEBookNoPoint />}

      {/* movie */}
      {isMovieShow && <MovieBook toggleMovieShow={toggleMovieShow} />}
    </>
  )
}
