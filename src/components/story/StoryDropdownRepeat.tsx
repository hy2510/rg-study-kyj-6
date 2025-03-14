import { useContext, useState } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'
import { useTranslation } from 'react-i18next'

import EBCSS from '@stylesheets/e-book.module.scss'

type StoryDropDownMenuProps = {
  menuName: string
  menuItems: { name: string; selected: '' | 'on' }[]
  changeMaxReadCnt: (cnt: number) => void
}

import icon_chev_down from '@assets/images/ebook/icon_chev_down.svg'

export default function StoryDropdownRepeat({
  menuName,
  menuItems,
  changeMaxReadCnt,
}: StoryDropDownMenuProps) {
  const { t } = useTranslation()
  const { handler } = useContext(AppContext) as AppContextProps

  // 기능: 메뉴 팝업 띄우기 및 버튼 선택시 이벤트
  const [isShow, setIsShow] = useState(false)
  const [menuList, setMenuList] =
    useState<StoryDropDownMenuProps['menuItems']>(menuItems)

  const selectedMode = menuList.filter((menu) => {
    return menu.selected === 'on'
  })

  const openMenu = () => {
    if (handler.storyMode === 'Story') {
      isShow ? setIsShow(false) : setIsShow(true)
    } else {
      alert(t('story.Listen & Repeat 모드에서는 지원하지 않는 기능입니다.'))
    }
  }
  return (
    <div className={EBCSS.ebook_play_bar_drop_down_menu}>
      <div className={EBCSS.read_mode_option} onClick={() => openMenu()}>
        <img
          src="src/assets/images/icons/ico_repeat.svg"
          width={16}
          height={16}
        />
        <span>{selectedMode[0].name.slice(6)}</span>
        <img src={icon_chev_down} width={15} alt="" />
      </div>
      {isShow && (
        <>
          <div className={EBCSS.read_mode_option_menu}>
            <div className={EBCSS.menu_name}>{menuName}</div>
            {menuList.map((menu, i) => {
              return (
                <div
                  className={`${EBCSS.menu_item} ${
                    menu.selected ? EBCSS.on : ''
                  }`}
                  onClick={() => {
                    const newList = [...menuList]

                    newList.map((b) => {
                      b.selected = ''
                    })
                    newList[i].selected = 'on'
                    changeMaxReadCnt(i + 1)
                    setMenuList(newList)
                    setIsShow(false)
                  }}
                >
                  {menu.name}
                </div>
              )
            })}
          </div>
          <div
            className={EBCSS.light_box}
            onClick={() => {
              setIsShow(false)
            }}
          ></div>
        </>
      )}
    </div>
  )
}
