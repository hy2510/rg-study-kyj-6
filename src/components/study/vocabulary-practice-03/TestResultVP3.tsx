import testResultCSS from '@stylesheets/test-result.module.scss'
import testResultCSSMobile from '@stylesheets/mobile/test-result.module.scss'

import MobileDetect from 'mobile-detect'
import useCharacter from '@hooks/study/useCharacter'

import Gap from '@components/study/common-study/Gap'

const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

const style = isMobile ? testResultCSSMobile : testResultCSS

type TestResultVP3Props = {
  goVocaTest: () => void
  changeRetry: (state: boolean) => void
}

export default function TestResultVP3({
  goVocaTest,
  changeRetry,
}: TestResultVP3Props) {
  const CHARACTER = useCharacter()

  return (
    <div className={style.testResult}>
      <div className={`${style.quizType} ${style.nextToVocaTest}`}>
        Begin Vocabulary Test?
      </div>

      <Gap height={30} />

      <div className={`${style.container} ${style.borderNone}`}>
        <div
          className={`${style.readingUnit} animate__animated animate__jackInTheBox`}
        >
          <img
            src={`https://wcfresource.a1edu.com/newsystem/image/character/subcharacter/${CHARACTER}_10.png`}
            alt=""
          />
        </div>

        <Gap height={50} />
      </div>

      <div
        className={style.goButton}
        onClick={() => {
          goVocaTest()
        }}
      >
        Go!
      </div>

      <Gap height={20} />

      <div
        className={style.notYetButton}
        onClick={() => {
          changeRetry(true)
        }}
      >
        Not yet
      </div>
    </div>
  )
}
