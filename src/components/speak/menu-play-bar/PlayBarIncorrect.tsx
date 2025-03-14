import { LottieAudioPlayAni } from '@components/common/LottieAnims'
import SpeakCSS from '@stylesheets/speak.module.scss'

export default function PlayBarIncorrect() {
  return (
    <div
      className={`${SpeakCSS.runIncorrectSign} animate__animated animate__slideInUp`}
    >
      Try Again
    </div>
  )
}
