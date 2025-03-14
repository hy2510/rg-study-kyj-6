import { IResultGEC } from '@interfaces/IGEC'
import axios from 'axios'

const API_URL = 'https://api.elasolution.com'
const API_KEY = '358ce3267dcb4729ad85dfa8808d5e45'

export default function useGEC() {
  const gec = async (text: string): Promise<IResultGEC> => {
    let result: IResultGEC

    const data = {
      text: text,
    }

    result = await axios
      .post(`${API_URL}/v1/gec/ap_style_title`, data, {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then((data) => data.data)

    return result
  }

  return { gec }
}

export { useGEC }
