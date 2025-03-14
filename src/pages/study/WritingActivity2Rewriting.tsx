import { useEffect, useState, useContext } from 'react'
import { AppContext, AppContextProps } from '@contexts/AppContext'

import { saveRewriting } from '@services/studyApi'
import { getWritingActivity2 } from '@services/quiz/WritingActivityAPI'

import writingActivityCSS from '@stylesheets/writing-activity.module.scss'
import writingActivityCSSMobile from '@stylesheets/mobile/writing-activity.module.scss'

// Types [
import { IStudyData, IUserAnswerRewriting } from '@interfaces/Common'
// ] Types

// utils & hooks
import { trimEnd, trimStart } from 'lodash'
import { useQuizTimer } from '@hooks/study/useQuizTimer'
import useStepIntro from '@hooks/common/useStepIntro'
import { useFetch } from '@hooks/study/useFetch'
import { useQuiz } from '@hooks/study/useQuiz'
import { useStudentAnswer } from '@hooks/study/useStudentAnswer'

import MobileDetect from 'mobile-detect'
const md = new MobileDetect(navigator.userAgent)
const isMobile = md.phone()

// components - common
import QuizHeader from '@components/study/common-study/QuizHeader'
import StudySideMenu from '@components/study/common-study/StudySideMenu'
import QuizBody from '@components/study/common-study/QuizBody'
import Gap from '@components/study/common-study/Gap'
import Container from '@components/study/common-study/Container'

// components - writing activity 2
import StepIntroRewriting from '@components/study/writing-activity-02/rewriting/StepIntroRewriting'
import ReWritingArea from '@components/study/writing-activity-02/review/ReWritingArea'
import GoNextStepBoxRewriting from '@components/study/writing-activity-02/rewriting/GoNextStepBoxRewriting'
import RevisionReport from '@components/study/writing-activity-02/RevisionReport'

const STEP_TYPE = 'Writing Activity'

const style = isMobile ? writingActivityCSSMobile : writingActivityCSS

export default function WritingActivity2Rewriting(props: IStudyData) {
  const { studyInfo, handler } = useContext(AppContext) as AppContextProps
  const STEP = props.currentStep

  const timer = useQuizTimer(() => {
    // timer가 0에 도달하면 호출되는 콜백함수 구현
    window.onLogoutStudy()
  })

  // 인트로 및 결과창
  const [introAnim, setIntroAnim] = useState<
    'animate__bounceInRight' | 'animate__bounceOutLeft'
  >('animate__bounceInRight')
  const { isStepIntro, closeStepIntro } = useStepIntro()

  // 사이드 메뉴
  const [isSideOpen, setSideOpen] = useState(false)

  // 퀴즈 데이터 세팅
  const { quizState, changeQuizState } = useQuiz()
  const [quizData, recordedData] = useFetch(getWritingActivity2, props, '7')
  const { scoreBoardData, setStudentAnswers } = useStudentAnswer(studyInfo.mode)

  // text area data
  const [answerData, setAnswerData] = useState<string[]>([])
  const [isSubmit, setIsSubmit] = useState<boolean>(false)

  useEffect(() => {
    if (!isStepIntro && quizData) {
      timer.setup(quizData.QuizTime, true)

      changeQuizState('studying')
    }
  }, [isStepIntro])

  useEffect(() => {
    if (quizData) {
      try {
        // 저장 기록이 있는 경우
        if (recordedData.length > 0) {
          const recordedWriting: string[] = []
          recordedData.map((record) => recordedWriting.push(record.TempText))

          setAnswerData([...recordedWriting])
        } else {
          const newAnswer = new Array(quizData.Writing.Question.length).fill('')

          switch (quizData.Writing.Activity) {
            case 'Book Report':
              newAnswer[0] = `The Title is ${quizData.Title}`
              newAnswer[1] = `The author is ${quizData.Author}`
              break

            case 'Book Review':
              newAnswer[0] =
                'Describe briefly what happens in the book or the main idea.'
              newAnswer[1] = 'What are interesting features of the book?'
              newAnswer[2] =
                "Describe some morals or new knowledge you've learnt from the book."
              break

            case 'KWL Chart':
              newAnswer[0] = 'What I know'
              newAnswer[1] = 'What I want to know'
              newAnswer[2] = 'What I learned'
              break

            case 'Story Map':
              newAnswer[0] = 'What happened first?'
              newAnswer[1] = 'What happened next?'
              newAnswer[2] = 'What happened last?'
              break
          }

          setAnswerData([...newAnswer])
        }

        setStudentAnswers(recordedData, 0) // 기존 데이터를 채점판에 넣어주기
      } catch (e) {
        console.error(e)
      }
    }
  }, [quizData])

  // 모든 텍스트에 조건에 충족하게 들어간 경우 submit버튼 활성화
  useEffect(() => {
    if (answerData && quizData) {
      // 1. 모든 textarea에 공백이 아닐 것
      // 2. min / max 조건
      const blankAnswerCnt = answerData.filter((answer) => answer === '').length
      const wordCount = getAnswerLength()

      if (
        blankAnswerCnt === 0 &&
        wordCount >= quizData.Writing.WordMinCount &&
        wordCount <= quizData.Writing.WordMaxCount
      ) {
        setIsSubmit(true)
      } else {
        setIsSubmit(false)
      }
    }
  }, [answerData])

  // 로딩
  if (!quizData) return <>Loading...</>

  const goWritingActivity = () => {
    setIntroAnim('animate__bounceOutLeft')
  }

  /**
   * writing 완료
   */
  const submitAnswer = async () => {
    changeQuizState('checking')

    if (quizState === 'studying') {
      const writedText = answerData.join(' ')

      const userAnswer: IUserAnswerRewriting = {
        bookType: props.bookType,
        studyId: props.studyId,
        studentHistoryId: props.studentHistoryId,
        writeText: writedText,
      }

      const res = await saveRewriting(userAnswer)
      if (Number(res.result) === 0) {
        handler.finishStudy = {
          id: Number(res.result),
          cause: res.resultMessage,
        }

        props.onFinishActivity()
      }
    }
  }

  /**
   * 텍스트 입력
   * @param text  텍스트
   */
  const onChangeHandler = (text: string = '') => {
    let prevData = answerData !== undefined ? [...answerData] : [text]
    prevData = text.split('\n\n')

    setAnswerData([...prevData])
  }

  /**
   * 사용자가 입력한 단어의 수를 구하는 함수
   * 공백이 반복되면 1개로 카운트한다
   * @returns 단어 수
   */
  const getAnswerLength = (): number => {
    const textLength = answerData.reduce(
      (acc, cur) =>
        acc +
        (cur === ''
          ? 0
          : trimStart(trimEnd(cur.replaceAll(/\s+/g, ' '))).split(' ').length),
      0,
    )

    return textLength
  }

  /**
   * 헤더 메뉴 클릭하는 기능
   */
  const changeSideMenu = (state: boolean) => {
    setSideOpen(state)
  }

  return (
    <>
      {isStepIntro ? (
        <div
          className={`animate__animated ${introAnim}`}
          onAnimationEnd={() => {
            if (introAnim === 'animate__bounceOutLeft') {
              closeStepIntro()
            }
          }}
        >
          <StepIntroRewriting
            currentSubmitCount={quizData.Writing.CurrentSubmitCount}
            maxSubmitCount={quizData.Writing.MaxSubmitCount}
            goWritingActivity={goWritingActivity}
          />
        </div>
      ) : (
        <>
          <QuizHeader
            quizNumber={1}
            totalQuizCnt={quizData.Writing.Question.length}
            life={1}
            timeMin={timer.time.timeMin}
            timeSec={timer.time.timeSec}
            changeSideMenu={changeSideMenu}
          />

          <div
            className={`${style.comment} animate__animated animate__fadeInLeft`}
          >
            {STEP_TYPE}
          </div>

          <QuizBody>
            {isMobile ? <></> : <Gap height={15} />}

            <Container
              typeCSS={style.writingActivity2}
              containerCSS={style.container}
            >
              {quizData.Rewriting && (
                <>
                  <RevisionReport
                    revisionImageTop={quizData.Rewriting.ReWritingImage1}
                    revisionImageBottom={quizData.Rewriting.ReWritingImage2}
                    comment={quizData.Rewriting.ReWritingComment}
                  />

                  {/* 글쓰기 영역 */}
                  <ReWritingArea
                    wordMinCount={quizData.Writing.WordMinCount}
                    wordMaxCount={quizData.Writing.WordMaxCount}
                    answerData={answerData}
                    isRewriting={quizData.Rewriting.IsReWriting}
                    onChangeHandler={onChangeHandler}
                  />

                  {quizData.Rewriting.IsReWriting && (
                    <GoNextStepBoxRewriting
                      isSubmit={isSubmit}
                      wordMinCount={quizData.Writing.WordMinCount}
                      wordMaxCount={quizData.Writing.WordMaxCount}
                      answerLength={getAnswerLength()}
                      submitAnswer={submitAnswer}
                    />
                  )}
                </>
              )}
            </Container>

            {isMobile ? <Gap height={5} /> : <Gap height={15} />}
          </QuizBody>

          {isSideOpen && (
            <StudySideMenu
              isSideOpen={isSideOpen}
              currentStep={STEP}
              currentStepType={STEP_TYPE}
              quizLength={0}
              maxAnswerCount={0}
              scoreBoardData={scoreBoardData}
              changeSideMenu={changeSideMenu}
              changeStep={props.changeStep}
            />
          )}
        </>
      )}
    </>
  )
}
