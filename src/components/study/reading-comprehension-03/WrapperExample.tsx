import { IReadingComprehension3Example } from '@interfaces/IReadingComprehension'
import { MultiPlayStateProps } from '@pages/study/ReadingComprehension3'

type WrapperExampleProps = {
  multiPlayState: MultiPlayStateProps
  correctText: string
  exampleData: IReadingComprehension3Example[]
  playSentence: (index: number) => void
  checkAnswer: (
    target: React.RefObject<HTMLDivElement>,
    index: number,
  ) => Promise<void>
  onAnimationEndHandler: (e: React.AnimationEvent<HTMLDivElement>) => void
}

import Example from './Example'

export default function WrapperExample({
  multiPlayState,
  correctText,
  exampleData,
  playSentence,
  checkAnswer,
  onAnimationEndHandler,
}: WrapperExampleProps) {
  return (
    <>
      {exampleData.map((example, i) => {
        return (
          <Example
            index={i}
            multiPlayState={multiPlayState}
            correctText={correctText}
            sentence={example.Text}
            playSentence={playSentence}
            checkAnswer={checkAnswer}
            onAnimationEndHandler={onAnimationEndHandler}
          />
        )
      })}
    </>
  )
}
