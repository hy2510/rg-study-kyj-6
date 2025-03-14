type SentenceProps = {
  pageNumber: number
  sentence: string
  sequence: number
  marginTop: number
  marginLeft: number
  clickSentence: (page: number, sequence: number) => void
}

export default function Sentence({
  pageNumber,
  sentence,
  sequence,
  marginTop,
  marginLeft,
  clickSentence,
}: SentenceProps) {
  const convertSentence = (sentence: string) => {
    const sentenceIDReg = /id=\"t/g

    let convertedSentence = sentence.replace(
      sentenceIDReg,
      `id="t_${pageNumber}_`,
    )

    if (sequence !== 999) {
      const clickStr = / id=\"t/g

      convertedSentence = convertedSentence.replace(
        clickStr,
        ` style='margin-top: ${marginTop}px; margin-left: ${marginLeft}px; cursor:pointer;' id="t`,
      )
    } else if (sequence === 999) {
      const seqStr = / id=\"t/g

      convertedSentence = convertedSentence.replace(
        seqStr,
        ` style='margin-top: ${marginTop}px; margin-left: ${marginLeft}px;' id="t`,
      )
    }

    return convertedSentence
  }

  const onClickHandler = () => {
    if (sequence !== 999) clickSentence(pageNumber, sequence)
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: convertSentence(sentence) }}
      onClick={() => onClickHandler()}
    ></div>
  )
}
