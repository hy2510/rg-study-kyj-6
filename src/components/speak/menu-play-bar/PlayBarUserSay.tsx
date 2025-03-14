import { LottieUserSayAni } from '@components/common/LottieAnims'
import SpeakCSS from '@stylesheets/speak.module.scss'

export default function PlayBarUserSay() {
  return (
    <div
      className={`${SpeakCSS.runVoicePlay} animate__animated animate__slideInUp`}
    >
      <LottieUserSayAni />
    </div>
  )
}
