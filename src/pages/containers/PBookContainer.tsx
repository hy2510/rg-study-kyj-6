import { ReactElement, useContext, useEffect, useState } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'

import QuizContainer from './QuizContainer'
import PopupPBookRating from '@components/story/PopupPBookRating'
import PopupPBookDecreasePoint from '@components/story/PopupPBookDecreasePoint'
import PopupPBookNoPoint from '@components/story/PopupPBookNoPoint'

const PBookContainer: React.FC<{}> = (s) => {
  const { handler, bookInfo } = useContext(AppContext) as AppContextProps

  // 컴포넌트 생성
  let component: ReactElement = <></>

  if (handler.isPreference) {
    component = <QuizContainer />
  } else {
    switch (bookInfo.FullEasyCode) {
      case '093001':
        // test 1회차
        component = <PopupPBookRating />
        break

      case '093002':
        // test 2회차 - 포인트 절반
        component = <PopupPBookDecreasePoint />
        break

      case '093003':
      case '093004':
      case '093005':
        // full easy - full
        if (bookInfo.FirstFullEasyCode === '093006') {
          handler.changeView('quiz')
        } else {
          component = <PopupPBookRating />
        }
        break

      case '093006':
        // full easy - easy
        if (
          bookInfo.FirstFullEasyCode === '093001' ||
          bookInfo.FirstFullEasyCode === '093003' ||
          bookInfo.FirstFullEasyCode === '093004' ||
          bookInfo.FirstFullEasyCode === '093005'
        ) {
          component = <PopupPBookDecreasePoint />
        } else {
          component = <PopupPBookRating />
        }
        break

      case '093007':
        component = <PopupPBookNoPoint />
        break
    }
  }

  return component
}
export default PBookContainer
