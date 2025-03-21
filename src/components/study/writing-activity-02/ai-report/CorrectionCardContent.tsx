import { useEffect, useState } from 'react'

import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'

const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()
const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

import { IMatch } from '@interfaces/IGEC'

type correctionCardContentProps = {
  match: IMatch
}

export default function correctionCardContent({
  match,
}: correctionCardContentProps) {
  const [isExamOpen, setExamOpen] = useState(false)
  let content

  if (match.value === '') {
    content = <span>삭제:{match.value} </span>
  } else if (match.length === 0) {
    content = <span>추가: {match.value}</span>
  } else {
    content = <span>변경: {match.value}</span>
  }

  return (
    <div className={style.correctionCardContents}>
      <div className={style.txtLabel}>{content}</div>
      <div className={style.aiFeedbackContents}>
        <div className={style.label}>
          <div className={style.icoMagicBlue} />
          AI Feedback
        </div>
        <div className={style.txtComment}>{match.feedback_ko}</div>
      </div>
      <div
        className={style.wrapperExample}
        onClick={() => {
          setExamOpen(!isExamOpen)
        }}
      >
        Example
        <div className={isExamOpen ? style.chevUpIcon : style.chevDownIcon} />
      </div>
      {isExamOpen && (
        <>
          {match.tag[0].example.map((example) => {
            return <div className={style.example}>{example.origin}</div>
          })}
        </>
      )}
    </div>
  )
}
