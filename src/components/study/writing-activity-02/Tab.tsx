import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type TabProps = {
  currentTabIndex: number
  index: number
  changeTabNo: (selectedTabIndex: number) => void
}

const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

export default function Tab({ currentTabIndex, index, changeTabNo }: TabProps) {
  return (
    <div
      className={`${style.tabButton} ${
        currentTabIndex === index ? style.active : ''
      }`}
      onClick={() => changeTabNo(index)}
    >
      {index + 1}
    </div>
  )
}
