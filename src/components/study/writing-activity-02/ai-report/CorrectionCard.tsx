import { MutableRefObject, useEffect } from 'react'

import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

import MobileDetect from 'mobile-detect'

const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()
const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

import icoArrowRight from '/src/assets/images/icons/ico_arrow_right.svg'

import { IMatch } from '@interfaces/IGEC'

import CorrectionCardContent from './CorrectionCardContent'

type correctionCardPops = {
  index: number
  cardRef: MutableRefObject<HTMLDivElement[]>
  match: IMatch
  openStates: {
    isOpen: boolean
  }[]
  changeOpenStates: (index: number, value: boolean) => void
}

export default function CorrectionCard({
  index,
  cardRef,
  match,
  openStates,
  changeOpenStates,
}: correctionCardPops) {
  let colorStyle

  switch (match.tag[0].category) {
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

  useEffect(() => {}, [openStates[index].isOpen])

  return (
    <div
      ref={(el: HTMLDivElement) => (cardRef.current[index] = el)}
      className={style.correctionCard}
    >
      <div
        className={style.correctionCardHeader}
        onClick={() => changeOpenStates(index, !openStates[index].isOpen)}
      >
        <div className={style.col1}>
          <div className={style.word}>
            <div className={`${style.dot} ${colorStyle}`}></div>
            {!openStates[index].isOpen && (
              <div className={style.txtword}>{match.value}</div>
            )}
          </div>
          <div className={style.shortDescription}>{match.tag[0].skill_ko}</div>
        </div>

        <div className={style.col2}>
          <div
            className={
              openStates[index].isOpen ? style.chevUpIcon : style.chevDownIcon
            }
          />
        </div>
      </div>

      {openStates[index].isOpen && <CorrectionCardContent match={match} />}
    </div>
  )
}
