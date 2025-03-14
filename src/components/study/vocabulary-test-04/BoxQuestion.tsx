import vocabularyCSS from '@stylesheets/vocabulary-test.module.scss'
import vocabularyCSSMobile from '@stylesheets/mobile/vocabulary-test.module.scss'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

import { IVocabulary4Test } from '@interfaces/IVocabulary'
type BoxQuestionProps = {
  quizData: IVocabulary4Test
  quizNo: number
}

import Mean from './Mean'

const style = isMobile ? vocabularyCSSMobile : vocabularyCSS

export default function BoxQuestion({ quizData, quizNo }: BoxQuestionProps) {
  return (
    <div className={style.questionBox}>
      <Mean
        meanData={quizData.Quiz[quizNo - 1]}
        mainMeanLang={quizData.MainMeanLanguage}
        subMeanLang={quizData.SubMeanLanguage}
      />
    </div>
  )
}
