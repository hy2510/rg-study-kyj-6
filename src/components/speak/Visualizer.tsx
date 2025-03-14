import { useEffect, useRef } from 'react'
import SpeakCSS from '@stylesheets/speak.module.scss'

import MobileDetect from 'mobile-detect'

const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

type VisualizerProps = {
  src: string
  color: string
}

export default function Visualizer({ src, color }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const setup = async () => {
      try {
        const response = await fetch(src)

        if (response.status === 200) {
          const audioContext = new AudioContext()
          const fileReader = new FileReader()
          const blob = await response.blob()
          const buffer = await blob.arrayBuffer()

          const onLoadHandler = async () => {
            audioContext.decodeAudioData(buffer).then((audioBuffer) => {
              drawGraph(getNormalizedData(getFilteredBuffer(audioBuffer)))
            })
          }

          fileReader.addEventListener('load', onLoadHandler)

          fileReader.readAsArrayBuffer(blob)
        }
      } catch (e) {
        alert(e)
      }
    }
    setup()
  }, [])

  const getFilteredBuffer = (audioBuffer: AudioBuffer) => {
    const filteredData = []
    const rawData = audioBuffer.getChannelData(0)
    const samples = Math.floor(audioBuffer.duration * 10)
    const blockSize = Math.floor(rawData.length / samples)

    for (let i = 0; i < samples; i++) {
      let blockStart = blockSize * i
      let sum = 0
      if (i === 0) {
        for (let j = 0; j < blockSize; j++) {
          sum = sum + Math.abs(rawData[blockStart + j])
        }
      } else {
        for (let j = 0; j < blockSize; j++) {
          sum = sum + Math.abs(rawData[blockStart - j])
        }
      }
      filteredData.push(sum / blockSize)
    }

    return filteredData
  }

  const getNormalizedData = (filteredData: number[]) => {
    const peak = Math.max(...filteredData)
    const multiplier = Math.pow(peak, -1)
    const normalizedData = filteredData.map((n) => n * multiplier)

    return normalizedData
  }

  const drawGraph = (normalizedData: number[]) => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      const dpr = 800 / window.innerWidth || 1

      if (ctx) {
        canvasRef.current.style.width = '100%'
        canvasRef.current.style.height = '100%'
        canvasRef.current.width = canvasRef.current.offsetWidth
        canvasRef.current.height = canvasRef.current.offsetHeight
        ctx.scale(dpr, 1)
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        ctx.lineWidth = isMobile ? 1 : 3
        ctx.strokeStyle = color
        ctx.beginPath()

        let sliceWidth =
          (canvasRef.current.width * (window.innerWidth / 800)) /
          (normalizedData.length - 1)
        let x = 0
        ctx.moveTo(x - 1, canvasRef.current.height)

        for (let i = 0; i < normalizedData.length - 1; i++) {
          let v =
            normalizedData[i] > 0.5
              ? normalizedData[i] * 0.97
              : normalizedData[i]
          let v_1 =
            normalizedData[i + 1] > 0.5
              ? normalizedData[i + 1] * 0.97
              : normalizedData[i + 1]
          let y = canvasRef.current.height * (1 - v)
          let y_1 = canvasRef.current.height * (1 - v_1)
          if (i === 0) {
            ctx.lineTo(x - 1, y)
          }

          let x_1 = x + sliceWidth
          let x_mid = (x + x_1) / 2
          let y_mid = (y + y_1) / 2
          let cp_x1 = (x_mid + x) / 2
          let cp_x2 = (x_mid + x_1) / 2
          ctx.quadraticCurveTo(cp_x1, y, x_mid, y_mid)
          ctx.quadraticCurveTo(cp_x2, y_1, x_1, y_1)
          x += sliceWidth
        }

        ctx.stroke()
        ctx.lineTo(canvasRef.current.width, canvasRef.current.height)
      }
    }
  }

  return (
    <div className={SpeakCSS.visualizer}>
      <canvas ref={canvasRef} style={{ position: 'relative' }}></canvas>
    </div>
  )
}
