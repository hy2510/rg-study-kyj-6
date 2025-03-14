// story에 관련된 api
import axios from 'axios'
import { IResultPreference } from '@interfaces/Common'

import { PageProps } from '@interfaces/IStory'
import {
  GET_BOOK_DATA_PATH,
  SUBMIT_ANIMATION_COMPLETE_PATH,
  SUBMIT_ANIMATION_COMPLETE_PATH_NB,
  SUBMIT_BOOK_MARK_PATH,
  SUBMIT_PREFERENCE_PATH,
  SUBMIT_READING_END_PATH,
  SUBMIT_READING_START_PATH,
} from '@constants/constant'

/**
 * story 정보 가져오기
 * @param studyId
 * @param studentHistoryId
 * @returns
 */
async function getStoryInfo(
  studyId: string,
  studentHistoryId: string,
): Promise<PageProps[]> {
  const requestUrl = `/${GET_BOOK_DATA_PATH}?studentHistoryId=${studentHistoryId}&studyId=${studyId}`
  let storyInfo: PageProps[]

  try {
    const res = await axios.get(requestUrl)

    if (res.status >= 200 && res.status < 300) {
      const response = res.data

      storyInfo = await response
    } else {
      throw new Error('Get Story Data Failed 1')
    }
  } catch (e) {
    console.error(e)
    throw new Error('Get Story Data Failed 2')
  }

  return storyInfo
}

/**
 * 첫장을 읽으면 DB에 저장한다.
 * @param studyId
 * @param studentHistoryId
 */
async function submitReadFirstPage(studyId: string, studentHistoryId: string) {
  let result = { success: false }

  try {
    const res = await axios.post(`/${SUBMIT_READING_START_PATH}`, {
      studyId: studyId,
      studentHistoryId: studentHistoryId,
    })

    if (res.status >= 200 && res.status < 300) {
      const response = await res.data

      if (response.success) {
        result = response
      } else {
        throw new Error('Post Preference Failed 1')
      }
    } else {
      throw new Error('Post Preference Failed 1')
    }
  } catch (e) {
    console.error(e)
  }

  return result
}

/**
 * 마지막 페이지를 읽으면 DB에 저장한다.
 * @param studyId
 * @param studentHistoryId
 */
async function submitReadLastPage(studyId: string, studentHistoryId: string) {
  let result = { success: false }

  try {
    const res = await axios.post(`/${SUBMIT_READING_END_PATH}`, {
      studyId: studyId,
      studentHistoryId: studentHistoryId,
    })

    if (res.status >= 200 && res.status < 300) {
      const response = await res.data

      if (response.success) {
        result = response
      } else {
        throw new Error('Post Preference Failed 1')
      }
    } else {
      throw new Error('Post Preference Failed 1')
    }
  } catch (e) {
    console.error(e)
  }

  return result
}

/**
 * 책갈피
 * @param studyId
 * @param studentHistoryId
 * @param page
 */
async function saveBookMark(
  studyId: string,
  studentHistoryId: string,
  page: number,
) {
  let result = { success: false }

  try {
    const res = await axios.post(`/${SUBMIT_BOOK_MARK_PATH}`, {
      studyId: studyId,
      studentHistoryId: studentHistoryId,
      page: page,
    })

    if (res.status >= 200 && res.status < 300) {
      const response = await res.data

      if (response.success) {
        result = response
      } else {
        throw new Error('Post Preference Failed 1')
      }
    } else {
      throw new Error('Post Preference Failed 1')
    }
  } catch (e) {
    console.error(e)
  }

  return result
}

/**
 * movie book을 끝까지 시청한 경우 값을 변경한다
 * @param studyId
 * @param studentHistoryId
 */
async function submitWatchMovie(studyId: string, studentHistoryId: string) {
  let result = { success: false }

  try {
    const res = await axios.post(`/${SUBMIT_ANIMATION_COMPLETE_PATH}`, {
      studyId: studyId,
      studentHistoryId: studentHistoryId,
    })

    if (res.status >= 200 && res.status < 300) {
      const response = await res.data

      if (response.success) {
        result = response
      } else {
        throw new Error('Post Preference Failed 1')
      }
    } else {
      throw new Error('Post Preference Failed 1')
    }
  } catch (e) {
    console.error(e)
  }

  return result
}

/**
 * movie book을 끝까지 시청한 경우 값을 변경한다 - 늘봄
 * @param studyId
 * @param studentHistoryId
 */
async function submitWatchMovieNB(studyId: string, studentHistoryId: string) {
  let result = { success: false }

  try {
    const res = await axios.post(`/${SUBMIT_ANIMATION_COMPLETE_PATH_NB}`, {
      studyId: studyId,
      studentHistoryId: studentHistoryId,
    })

    if (res.status >= 200 && res.status < 300) {
      const response = await res.data

      if (response.success) {
        result = response
      } else {
        throw new Error('Post Preference Failed 1')
      }
    } else {
      throw new Error('Post Preference Failed 1')
    }
  } catch (e) {
    console.error(e)
  }

  return result
}

/**
 * 별점 주기
 * @param studyId
 * @param studentHistoryId
 * @param preference
 */
async function submitPreference(
  studyId: string,
  studentHistoryId: string,
  preference: number,
): Promise<IResultPreference> {
  let result: IResultPreference = { success: false }

  try {
    const res = await axios.post(`/${SUBMIT_PREFERENCE_PATH}`, {
      studyId: studyId,
      studentHistoryId: studentHistoryId,
      preference: preference,
    })

    if (res.status >= 200 && res.status < 300) {
      const response = await res.data

      if (response.success) {
        result = response
      } else {
        throw new Error('Post Preference Failed 1')
      }
    } else {
      throw new Error('Post Preference Failed 1')
    }
  } catch (e) {
    console.error(e)
  }

  return result
}

export {
  getStoryInfo,
  submitPreference,
  submitReadFirstPage,
  submitReadLastPage,
  saveBookMark,
  submitWatchMovie,
  submitWatchMovieNB,
}
