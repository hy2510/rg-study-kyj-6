import style from '@stylesheets/e-book.module.scss'

import { IVocabulary4Quiz } from '@interfaces/IVocabulary'

import icon_speak from '@assets/images/ebook/icon_speaker.svg'
import { PlayState } from '@interfaces/IStory'
import useStoryAudioWord from '@hooks/story/useStoryAudioWord'

type VocaList4Props = {
  vocaData: IVocabulary4Quiz
  mainLang: string
  playState: PlayState
  pauseStoryAudio: () => void
  resumeStoryAudio: () => void
}

export default function VocaList4({
  vocaData,
  mainLang,
  playState,
  pauseStoryAudio,
  resumeStoryAudio,
}: VocaList4Props) {
  const { playAudio } = useStoryAudioWord({
    playState,
    pauseStoryAudio,
    resumeStoryAudio,
  })

  let word = vocaData.Examples[0]?.Text
    ? vocaData.Examples[0].Text
    : vocaData.Question.Text
  let mean = ''

  switch (mainLang.toLowerCase()) {
    case 'korean':
      mean = vocaData.Question.Korean
      break
    case 'chinese':
      mean = vocaData.Question.Chinese
      break
    case 'japanese':
      mean = vocaData.Question.Japanese
      break
    case 'vietnamese':
      mean = vocaData.Question.Vietnamese
      break
    case 'indonesian':
      mean = vocaData.Question.Indonesian
      break
    case 'english':
      mean = vocaData.Question.Britannica ? vocaData.Question.Britannica : ''
      break
  }

  return (
    <div className={style.voca_item}>
      <div className={style.word_item}>
        <div className={style.word}>{word}</div>
        <img
          src={icon_speak}
          alt=""
          onClick={() => {
            playAudio(vocaData.Question.Sound)
          }}
        />
      </div>
      <div className={style.mean}>{mean}</div>
    </div>
  )
}
