import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'
import MobileDetect from 'mobile-detect'
import icoArrowRight from '/src/assets/images/icons/ico_arrow_right.svg'
import { useState, ReactNode } from 'react'

const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()
const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

const getTextColor = (correctionType: string): string => {
  const colorMap: Record<string, string> = {
    grammar: style.green,
    mechanics: style.red,
    other: style.yellow,
    punctuation: style.blue,
  }
  return colorMap[correctionType] || style.gray
}

interface CorrectionData {
  correctionType: 'grammar' | 'mechanics' | 'other' | 'punctuation'
  inCorrectText: string
  shortDescription: string
  correction: string
  aiFeedback: string
  example: ReactNode
}

export default function AiFeedbackReport() {
  return (
    <div className={style.aiFeedbackReport}>
      <LeftArea />
      <RightArea />
    </div>
  )
}

function LeftArea() {
  return (
    <div className={style.leftArea}>
      I went surfing with my family. At first, I felt like I was going to
      <WrongText correctionType="grammar">geted geted</WrongText> nauseous
      <WrongText correctionType="punctuation"> </WrongText>
      With my dad's encouragement, I gained
      <WrongText correctionType="mechanics">dcourage</WrongText>
      and succeeded. The feeling of nausea disappeared. I'm glad I found the joy
      of <WrongText correctionType="mechanics">surffing</WrongText>.
    </div>
  )
}

function RightArea() {
  return (
    <div className={style.rightArea}>
      <CorrectionHeader />
      {correctionData.map((item, index) => (
        <CorrectionCard key={index} {...item} />
      ))}
    </div>
  )
}

const correctionData: CorrectionData[] = [
  {
    correctionType: 'grammar',
    inCorrectText: 'coffe~',
    correction: 'coffee',
    shortDescription: '마침표 오류',
    aiFeedback: '이렇쿵 저렇쿵 이래라 저래라',
    example: <div>이게 데이터가 어떨지 모르겠네..</div>,
  },
  {
    correctionType: 'mechanics',
    inCorrectText: 'coffe~',
    correction: 'coffee',
    shortDescription: '마침표 오류',
    aiFeedback: '이렇쿵 저렇쿵 이래라 저래라',
    example: <div>이게 데이터가 어떨지 모르겠네..</div>,
  },
  {
    correctionType: 'punctuation',
    inCorrectText: ' ',
    correction: '.',
    shortDescription: '마침표 오류',
    aiFeedback: '이렇쿵 저렇쿵 이래라 저래라',
    example: <div>이게 데이터가 어떨지 모르겠네..</div>,
  },
]

interface WrongTextProps {
  children: ReactNode
  correctionType: 'grammar' | 'mechanics' | 'other' | 'punctuation'
}

function WrongText({ children, correctionType }: WrongTextProps) {
  return (
    <span className={`${style.wrongText} ${getTextColor(correctionType)}`}>
      {children === ' ' ? '_' : children}
    </span>
  )
}

function CorrectionHeader() {
  const counts: Record<string, number> = {
    grammar: 100,
    mechanics: 10,
    other: 1,
    punctuation: 1,
  }
  const totalCorrectionCount = Object.values(counts).reduce(
    (acc, val) => acc + val,
    0,
  )

  return (
    <div className={style.correctionHeader}>
      <div className={style.txtHeader}>
        Total Corrections - {totalCorrectionCount}
      </div>
      <div className={style.correctionItems}>
        {Object.entries(counts).map(([type, count]) => (
          <div
            key={type}
            className={`${style.correctionItem} ${getTextColor(type)}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)} <span>{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CorrectionCard({
  correctionType,
  inCorrectText,
  shortDescription,
  correction,
  aiFeedback,
  example,
}: CorrectionData) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={style.correctionCard}>
      <div
        className={style.correctionCardHeader}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={style.col1}>
          <div className={style.word}>
            <div className={`${style.dot} ${getTextColor(correctionType)}`} />
            {!isOpen && (
              <div className={style.txtWord}>
                {inCorrectText === ' ' ? '_' : inCorrectText}
              </div>
            )}
          </div>
          <div className={style.shortDescription}>{shortDescription}</div>
        </div>
        <div className={style.col2}>
          <div className={isOpen ? style.chevUpIcon : style.chevDownIcon} />
        </div>
      </div>
      {isOpen && (
        <div className={style.correctionCardContents}>
          <div className={style.txtLabel}>
            Correction:{' '}
            <span className={style.inCorrectText}>{inCorrectText}</span>
            {correction && (
              <>
                <img src={icoArrowRight} width={14} height={16} alt="" />
                <span>{correction}</span>
              </>
            )}
          </div>
          <div className={style.aiFeedbackContents}>
            <div className={style.label}>
              <div className={style.icoMagicBlue} />
              AI Feedback
            </div>
            <div className={style.txtComment}>{aiFeedback}</div>
          </div>
          <div className={style.txtLabel}>Example</div>
          <div className={style.example}>{example}</div>
        </div>
      )}
    </div>
  )
}
