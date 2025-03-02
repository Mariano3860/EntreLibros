import { Flip, toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import styles from './Toaster.module.scss'
import { useThemeDetector } from '@hooks/theme/useThemeDetector'

export const Toaster = () => {
  const currentTheme = useThemeDetector()

  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick={true}
      rtl={false}
      pauseOnFocusLoss
      pauseOnHover
      theme={currentTheme}
      transition={Flip}
      className={currentTheme === 'dark' ? styles.toastDark : styles.toastLight}
    />
  )
}

export const showToast = (
  message: string,
  type: 'success' | 'error' | 'info'
) => {
  switch (type) {
    case 'success':
      toast.success(message)
      break
    case 'error':
      toast.error(message)
      break
    case 'info':
      toast.info(message)
      break
    default:
      toast(message)
  }
}
