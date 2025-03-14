type SentenceProps = {
  pageNumber: number
  sentence: string
  sequence: number
  marginTop: number
  marginLeft: number
}

export default function Sentence({
  pageNumber,
  sentence,
  sequence,
  marginTop,
  marginLeft,
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
        ` style='margin-top: ${marginTop}px; margin-left: ${marginLeft}px;' id="t`,
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

  return (
    <div dangerouslySetInnerHTML={{ __html: convertSentence(sentence) }}></div>
  )
}
