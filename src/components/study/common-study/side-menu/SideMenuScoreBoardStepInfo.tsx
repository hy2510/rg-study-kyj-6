import { useContext } from 'react'

import sideMenuCSS from '@stylesheets/side-menu.module.scss'

import { AppContext, AppContextProps } from '@contexts/AppContext'

type SideMenuScoreBoardStepInfoProps = {
  currentStep: number | string
  changeStep: (step: number) => void
}

export default function SideMenuScoreBoardStepInfo({
  currentStep,
  changeStep,
}: SideMenuScoreBoardStepInfoProps) {
  const { studyInfo } = useContext(AppContext) as AppContextProps

  return (
    <>
      {studyInfo.openSteps.map((step, i) => {
        return (
          <div
            key={`step-header-${i}`}
            className={`${sideMenuCSS.step} ${
              currentStep === step || studyInfo.mode !== 'student'
                ? sideMenuCSS.on
                : ''
            }`}
            onClick={() => {
              if (studyInfo.mode !== 'student') changeStep(step)
            }}
          >
            {currentStep === step ? 'Step' : ''}
            {step}
          </div>
        )
      })}
    </>
  )
}
