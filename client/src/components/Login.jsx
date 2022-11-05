// Library Imports
import { useState } from 'react'

// Component Imports
import { PhoneEntry, LoginHome, loginPages} from "./resources/LoginResources";

export default function Login() {

  const [loginPage, setLoginPage] = useState(loginPages.HOME);

  function getLoginPage() {
    if (loginPage === loginPages.PHONE) {
      return <PhoneEntry setLoginPage={setLoginPage}/>
    }
    return <LoginHome setLoginPage={setLoginPage} />;
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center h-100">
        <h1>Citrus</h1>
        { getLoginPage() }
    </div>
  )
}