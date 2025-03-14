import Lottie from 'react-lottie'

import aniDataScrollDown from '@assets/anims/scrolldown.json'
import aniDataRecord from '@assets/anims/record.json'
import aniDataUserSay from '@assets/anims/user-say.json'
import aniDataAudioPlay from '@assets/anims/audio-play.json'
import aniDataExcellent from '@assets/anims/excellent.json'
import aniDataGoodEffort from '@assets/anims/good-effort.json'

export function LottieScrollDownAni() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: aniDataScrollDown,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }

  return (
    <>
      <Lottie
        isClickToPauseDisabled
        options={defaultOptions}
        height={300}
        width={300}
      />
    </>
  )
}

export function LottieRecordAni() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: aniDataRecord,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }

  return (
    <>
      <Lottie
        isClickToPauseDisabled
        options={defaultOptions}
        height={40}
        width={40}
      />
    </>
  )
}

export function LottieRecordAniBig() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: aniDataRecord,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }

  return (
    <>
      <Lottie
        isClickToPauseDisabled
        options={defaultOptions}
        height={200}
        width={200}
      />
    </>
  )
}

export function LottieUserSayAni() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: aniDataUserSay,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }

  return (
    <>
      <Lottie
        isClickToPauseDisabled
        options={defaultOptions}
        height={80}
        width={98}
      />
    </>
  )
}

export function LottieAudioPlayAni() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: aniDataAudioPlay,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }

  return (
    <>
      <Lottie
        isClickToPauseDisabled
        options={defaultOptions}
        height={40}
        width={50}
      />
    </>
  )
}

type ExcellentProps = {
  width: number
  height: number
}
export function LottieExcellentAni({ width, height }: ExcellentProps) {
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: aniDataExcellent,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }

  return (
    <>
      <Lottie
        isClickToPauseDisabled
        options={defaultOptions}
        width={width}
        height={height}
      />
    </>
  )
}

type GoodEffortProps = {
  width: number
  height: number
}

export function LottieGoodEffortAni({ width, height }: GoodEffortProps) {
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: aniDataGoodEffort,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }

  return (
    <>
      <Lottie
        isClickToPauseDisabled
        options={defaultOptions}
        width={width}
        height={height}
      />
    </>
  )
}
