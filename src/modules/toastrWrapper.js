import { toast as toaster } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css'

const toast={
  info({text,title,config}){

    return toaster.info(text, { appearance: 'info' })
  },
  success({text,title,config}){
    return toaster.success(text, { appearance: 'success' })
  },
  error({text,title,config}){
    return toaster.error(text, { appearance: 'error' })
  }
};

export default toast;
