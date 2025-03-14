import { LottieRecordAni } from '@components/common/LottieAnims'
import SpeakCSS from '@stylesheets/speak.module.scss'

export default function PlayBarRecording() {
  return (
    <div
      className={`${SpeakCSS.runVoiceRecord} animate__animated animate__slideInUp`}
    >
      <LottieRecordAni />
    </div>
  )
}
