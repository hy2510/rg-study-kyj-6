import { LottieAudioPlayAni } from '@components/common/LottieAnims'
import SpeakCSS from '@stylesheets/speak.module.scss'

export default function PlayBarPlaySentence() {
  return (
    <div
      className={`${SpeakCSS.runEbookAudioPlay} animate__animated animate__slideInUp`}
    >
      <LottieAudioPlayAni />
    </div>
  )
}
