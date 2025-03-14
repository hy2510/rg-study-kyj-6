import SpeakCSS from '@stylesheets/speak.module.scss'

type BtnPlaySentenceProps = {
  playSentence: () => void
}

export default function BtnPlaySentence({
  playSentence,
}: BtnPlaySentenceProps) {
  return (
    <button className={SpeakCSS.btnSpeakPlay} onClick={() => playSentence()}>
      <div className={`${SpeakCSS.icon} ${SpeakCSS.play}`}></div>
      <div className={SpeakCSS.txtWord}>Listen</div>
    </button>
  )
}
