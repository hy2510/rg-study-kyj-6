import SpeakCSS from '@stylesheets/speak.module.scss'
import BtnRecord from './BtnRecord'
import BtnPlaySentence from './BtnPlaySentence'

type PlayBarDefaultProps = {
  playSentence: () => void
  startRecord: () => void
}

export default function PlayBarDefault({
  playSentence,
  startRecord,
}: PlayBarDefaultProps) {
  return (
    <div
      className={`${SpeakCSS.runReady} animate__animated animate__slideInUp`}
    >
      <BtnPlaySentence playSentence={playSentence} />

      <div className={SpeakCSS.txtSome}>•</div>

      <BtnRecord startRecord={startRecord} />
    </div>
  )
}
