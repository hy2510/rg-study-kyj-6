import { useEffect, useState, useContext } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'

import SpeakCSS from '@stylesheets/speak.module.scss'

import { PageSequenceProps, SpeakPageProps } from '@interfaces/ISpeak'
import Sentence from './Sentence'
import HighlightSentence from './HighlightSentence'

type PageProps = {
  pageNumber: number
  pageSeq: PageSequenceProps
  speakData: SpeakPageProps[]
  clickSentence: (pageNumber: number, sequnece: number) => void
}

export default function SpeakPage({
  pageNumber,
  pageSeq,
  speakData,
  clickSentence,
}: PageProps) {
  const { bookInfo } = useContext(AppContext) as AppContextProps

  const [css, setCss] = useState<string>('')
  const [sentencesData, setSentenceData] = useState<SpeakPageProps[]>()
  const [image, setImage] = useState<string>()

  const [slideAni, setSlideAni] = useState('')
  const [currentPageNum, setCurrentPageNum] = useState(pageNumber)

  useEffect(() => {
    if (speakData) {
      // css
      const pageCss = speakData.find(
        (data) => data.Page === pageNumber && data.Sequence === 999,
      )?.Css

      if (pageCss) {
        // style css
        const cssIDReg = /\#t/g
        const convertedCss = pageCss.replace(cssIDReg, `#t_${pageNumber}_`)

        setCss(convertedCss)
      }
      // css end

      // image
      const imagePath = speakData.find(
        (data) => data.Page === pageNumber && data.Sequence === 999,
      )?.ImagePath

      // sentence
      const sentences = speakData.filter((data) => data.Page === pageNumber)

      setImage(imagePath)
      setSentenceData(sentences)

      if (currentPageNum < pageNumber) {
        setCurrentPageNum(pageNumber)
        setSlideAni('slide-in-right')
        setTimeout(() => {
          setSlideAni('')
        }, 100)
      } else {
        setCurrentPageNum(pageNumber)
        setSlideAni('slide-in-left')
        setTimeout(() => {
          setSlideAni('')
        }, 100)
      }
    }
  }, [pageNumber])

  return (
    <div
      style={{
        backgroundImage: `url(${image})`,
      }}
      className={`${SpeakCSS.speakEbookPage} ${
        bookInfo.Grade === 'K' ? SpeakCSS.levelK : SpeakCSS.level1
      }`}
    >
      <div dangerouslySetInnerHTML={{ __html: css }}></div>
      {sentencesData &&
        sentencesData.map((data) => {
          if (
            pageSeq.playPage === pageNumber &&
            data.Sequence !== 999 &&
            data.Sequence === pageSeq.sequnce
          ) {
            return (
              <HighlightSentence
                pageNumber={pageNumber}
                sequence={data.Sequence}
                sentence={data.Contents}
                marginTop={data.MarginTop}
                marginLeft={data.MarginLeft}
                color={data.FontColor}
                clickSentence={clickSentence}
              />
            )
          } else {
            return (
              <Sentence
                pageNumber={pageNumber}
                sequence={data.Sequence}
                sentence={data.Contents}
                marginTop={data.MarginTop}
                marginLeft={data.MarginLeft}
              />
            )
          }
        })}
    </div>
  )
}
