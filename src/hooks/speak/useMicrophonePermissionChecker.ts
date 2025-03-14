import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

function useMicrophonePermissionChecker() {
  const { t } = useTranslation()
  const [micPermission, setMicPermission] = useState('')

  const alertMessage = t(
    'speak.기기의 마이크 사용이 차단되었습니다. 해제 후 다시 사용해 주세요.',
  )

  useEffect(() => {
    // 마이크 권한 확인 함수
    const checkMicPermission = async () => {
      try {
        const permission = await navigator.permissions.query({
          name: 'microphone' as PermissionName,
        })
        setMicPermission(permission.state)

        // 권한 상태가 변할 때마다 업데이트
        permission.onchange = () => {
          setMicPermission(permission.state)
        }
      } catch (error) {
        console.error(t('speak.마이크 권한을 확인할 수 없습니다.'), error)
      }
    }

    checkMicPermission()
  }, [])

  // granted(승인됨), denied(거부됨), prompt(사용자 승인 필요)
  return { micPermission, alertMessage }
}

export { useMicrophonePermissionChecker }
