import { useEffect, useState } from 'react'

import quizTemplateCSS from '@stylesheets/quiz-template.module.scss'
import quizTemplateCSSMobile from '@stylesheets/mobile/quiz-template.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

const style = isMobile ? quizTemplateCSSMobile : quizTemplateCSS

type QuizBodyProps = {
  children: JSX.Element | JSX.Element[]
}

export default function QuizBody({ children }: QuizBodyProps) {
  // 태블릿에서 소프트웨어 키보드 실행여부
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  // 태블릿의 방향
  const [orientationLandscape, setOrientationLandscape] = useState(
    screen.orientation?.type == 'landscape-primary',
  )

  useEffect(() => {
    const initialViewportHeight = window.visualViewport
      ? window.visualViewport.height
      : window.innerHeight

    const handleResize = () => {
      const currentViewportHeight = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight

      if (md.tablet() || md.mobile()) {
        setIsKeyboardVisible(currentViewportHeight < initialViewportHeight)
      }
    }

    window.visualViewport?.addEventListener('resize', handleResize)

    const handleOrientationChange = () => {
      setOrientationLandscape(screen.orientation?.type == 'landscape-primary')
    }

    screen.orientation?.addEventListener('change', handleOrientationChange)

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize)
      screen.orientation?.removeEventListener('change', handleOrientationChange)
    }
  }, [isKeyboardVisible, orientationLandscape])

  return (
    <div
      className={`${style.quizBody} ${
        isKeyboardVisible && orientationLandscape && style.activeKeyboard
      } animate__animated animate__fadeIn`}
    >
      <div
        className={`${style.container} ${
          isKeyboardVisible && orientationLandscape && style.activeKeyboard
        }`}
      >
        {children}
      </div>
    </div>
  )
}
