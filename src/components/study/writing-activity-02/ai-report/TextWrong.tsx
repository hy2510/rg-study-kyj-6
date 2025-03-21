import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'
import { ITag } from '@interfaces/IGEC'
import { MutableRefObject } from 'react'

const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()
const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

interface TextWrongProps {
  cardRef: MutableRefObject<HTMLDivElement[]>
  index: number
  text: string
  correctionType: ITag['category']
  changeOpenStates: (index: number, value: boolean) => void
}

export default function TextWrong({
  cardRef,
  index,
  text,
  correctionType,
  changeOpenStates,
}: TextWrongProps) {
  let colorStyle

  switch (correctionType) {
    case 'Grammar':
      colorStyle = style.green
      break

    case 'Mechanics':
      colorStyle = style.red
      break

    case 'Other':
      colorStyle = style.yellow
      break

    case 'Punctuations':
      colorStyle = style.blue
      break
  }

  return (
    <span
      className={`${style.wrongText} ${colorStyle}`}
      onClick={() => {
        changeOpenStates(index, true)
        setTimeout(() => {
          cardRef.current[index].scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }, 160)
      }}
    >
      {text !== '' ? text : <>&nbsp;&nbsp;</>}
    </span>
  )
}
