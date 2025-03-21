import { MutableRefObject, ReactElement } from 'react'
import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'

const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()
const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

import { IMatch } from '@interfaces/IGEC'

import TextWrong from './TextWrong'

type ReportAreaLeftProps = {
  cardRef: MutableRefObject<HTMLDivElement[]>
  text: string
  schedules: IMatch[]
  changeOpenStates: (index: number, value: boolean) => void
}

export default function ReportAreaLeft({
  cardRef,
  text,
  schedules,
  changeOpenStates,
}: ReportAreaLeftProps) {
  let component: ReactElement = <></>
  let replacedText = text

  const array = [...schedules]
  const reverseArray = array.reverse()

  reverseArray.map((match, i) => {
    const offset = match.offset
    const length = match.length
    const category = match.tag[0].category
    const matchText = text.substring(offset, offset + length)
    const prevSentence = replacedText.substring(0, offset)
    const backSentence = replacedText.substring(offset + length)

    const wrongTextJSX: ReactElement = (
      <TextWrong
        cardRef={cardRef}
        index={reverseArray.length - i - 1}
        text={matchText.trimStart().trimEnd()}
        correctionType={category}
        changeOpenStates={changeOpenStates}
      />
    )

    component = (
      <>
        {wrongTextJSX}
        {backSentence.trimStart().trimEnd()}
        {component}
      </>
    )

    replacedText = prevSentence

    if (i === reverseArray.length - 1) {
      component = (
        <>
          {prevSentence.trimStart().trimEnd()}
          {component}
        </>
      )
    }
  })

  return <div className={style.leftArea}>{component}</div>
}
