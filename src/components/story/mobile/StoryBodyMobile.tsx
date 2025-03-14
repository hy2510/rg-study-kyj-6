import { useContext } from 'react'
import { AppContext } from '@contexts/AppContext'

import style from '@stylesheets/e-book.module.scss'

type StoryBodyMobileProps = {
  onTouchStartHandler: (e: React.TouchEvent<HTMLDivElement>) => void
  onTouchEndHandler: (e: React.TouchEvent<HTMLDivElement>) => void
  children: JSX.Element
}

export default function StoryBodyMobile({
  onTouchStartHandler,
  onTouchEndHandler,
  children,
}: StoryBodyMobileProps) {
  const bookLevel =
    useContext(AppContext)?.bookInfo?.BookLevel?.substring(0, 1) || 'K'

  const isLandScape = window.matchMedia('(orientation: landscape)').matches

  const pageWidth = bookLevel === 'K' ? 480 : 525
  const pageHeight = 750

  const containerScale =
    window.innerWidth > 700
      ? (bookLevel === 'K'
          ? window.innerHeight - 60
          : window.innerHeight - 120) / pageHeight
      : window.innerWidth / pageWidth
  const containerLandScape =
    (bookLevel === 'K' ? window.innerHeight - 20 : window.innerHeight - 40) /
    pageHeight

  return (
    <div
      className={style.ebook_body_mobile_p}
      onTouchStart={(e) => onTouchStartHandler(e)}
      onTouchEnd={(e) => onTouchEndHandler(e)}
    >
      <div
        className={style.container}
        style={{
          transform: `scale(${
            isLandScape ? containerLandScape : containerScale
          })`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
