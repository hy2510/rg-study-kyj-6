import { useEffect, useRef, useState } from 'react'

type AudioProps = {
  quizNo: number
  src: string
}

export default function Audio({ quizNo, src }: AudioProps) {
  const [audioSrc, setAudioSrc] = useState(src)

  useEffect(() => {
    setAudioSrc(src)
  }, [quizNo])

  useEffect(() => {}, [audioSrc])

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <audio
        src={audioSrc}
        style={{ width: '90%' }}
        autoPlay
        controls
        controlsList={'nodownload'}
      ></audio>
    </div>
  )
}
