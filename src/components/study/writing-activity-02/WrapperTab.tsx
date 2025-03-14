import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { IWritingActivity2Writing } from '@interfaces/IWritingActivity'
import Tab from './Tab'

type WrapperTabProps = {
  currentTabIndex: number
  questionData: IWritingActivity2Writing['Question']
  changeTabNo: (selectedTabIndex: number) => void
}

const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

export default function WrapperTab({
  currentTabIndex,
  questionData,
  changeTabNo,
}: WrapperTabProps) {
  return (
    <div className={style.tabs}>
      {questionData.map((question, index) => {
        return (
          <Tab
            currentTabIndex={currentTabIndex}
            index={index}
            changeTabNo={changeTabNo}
          />
        )
      })}
    </div>
  )
}
