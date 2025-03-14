import SpeakCSS from '@stylesheets/speak.module.scss'

export default function PlayBarCorrect() {
  return (
    <div
      className={`${SpeakCSS.runCorrectSign} animate__animated animate__slideInUp`}
    >
      Good Job!
    </div>
  )
}
