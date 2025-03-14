import SpeakCSS from '@stylesheets/speak.module.scss'

export default function Header() {
  return (
    <div>
      <button
        className={SpeakCSS.btnExit}
        onClick={() => window.onExitStudy()}
      ></button>
    </div>
  )
}
