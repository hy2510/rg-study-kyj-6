import { useContext, useState } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useTranslation } from 'react-i18next'

import style from '@stylesheets/e-book.module.scss'

import Label from './Label'

type PageTurningTypeProps = {
  isAutoNextPage: boolean
  changeAutoNext: (isAuto: boolean) => void
}

export default function PageTurningType({
  isAutoNextPage,
  changeAutoNext,
}: PageTurningTypeProps) {
  const { t } = useTranslation()
  const { handler } = useContext(AppContext) as AppContextProps

  const [menuList, setMenuList] = useState([
    { name: t('story.수동으로 넘기기'), selected: isAutoNextPage ? '' : 'on' },
    { name: t('story.자동으로 넘기기'), selected: isAutoNextPage ? 'on' : '' },
  ])

  const changeAutoNextType = (index: number) => {
    if (handler.storyMode === 'Story') {
      const newList = [...menuList]

      newList.map((b) => {
        b.selected = ''
      })
      newList[index].selected = 'on'
      setMenuList(newList)
      changeAutoNext(index === 0 ? false : true)
    } else {
      alert(t('story.Listen & Repeat 모드에서는 지원하지 않는 기능입니다.'))
    }
  }

  return (
    <>
      <Label text={t('story.책장 넘기기')} />
      <div className={style.page_turning_mode}>
        {menuList.map((menu, i) => {
          return (
            <div
              className={
                menu.selected === ''
                  ? style.choose_button
                  : `${style.choose_button} ${style.on}`
              }
              onClick={() => {
                changeAutoNextType(i)
              }}
            >
              {menu.name}
            </div>
          )
        })}
      </div>
    </>
  )
}
