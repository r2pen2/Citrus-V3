// Library Imports
import { useState, useEffect }from 'react'

function handlePhoneLogin() {
    console.log("SHIT FUCK");
}

const loginPages = {
    HOME: "home",
    PHONE: "phone",
}

const phoneEntryPages = {
  NUMBER: "number",
  AUTH: "auth",
}

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

function LoginHome({setLoginPage}) {
  return (
    <div>
      <button onClick={() => setLoginPage(loginPages.PHONE)}>Login with Phone</button>
      <button onClick={() => console.log("Google sign-in!")}>Login with Google</button>
    </div>
  )
}

function PhoneEntry({setLoginPage}) {

  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneEntryPage, setPhoneEntryPage] = useState(phoneEntryPages.NUMBER);

  function updatePhoneNumber(e) {
    const string = e.target.value;
    if (!isNaN(string) && string.length <= 10) {
      setPhoneNumber(string);
    }
  }

  function getPhonePage() {
    if (phoneEntryPage === phoneEntryPages.NUMBER) {
      return <PhoneNumberEntry goBack={() => setLoginPage(loginPages.HOME)} next={() => setPhoneEntryPage(phoneEntryPages.AUTH)} phoneNumber={phoneNumber} updatePhoneNumber={updatePhoneNumber}/>;
    }
    return <AuthCodeEntry goBack={() => setPhoneEntryPage(phoneEntryPages.NUMBER)} next={console.log("Handle auth submit")} phoneNumber={phoneNumber}/>;
  }

  return (
    <div>
      { getPhonePage() }
    </div>
  )
}

function PhoneNumberEntry({goBack, next, phoneNumber, updatePhoneNumber}) {
  return (
    <div>
      <form>
      <div class="form-group">
        <label for="phone-input">Phone Number</label>
        <input type="tel" className="form-control" id="phone-input" placeHolder="(123) 456-7890" value={phoneNumber} onChange={updatePhoneNumber}/>
      </div>
      </form>
      <button onClick={next}>Text Me</button>
      <button onClick={goBack}>Back</button>
    </div>
  )
}

function AuthCodeEntry({goBack, next, phoneNumber}) {

  const [authCode, setAuthCode] = useState("");

  function handleAuthCodeChange(e) {
    const string = e.target.value;
    if (string.length <= 6) {
      setAuthCode(string);
    }
  }

  return (
    <div>
      <form>
      <div class="form-group">
        <label for="auth-input">Auth Code</label>
        <input type="text" className="form-control" id="auth-input" value={authCode} onChange={handleAuthCodeChange}/>
      </div>
      </form>
      <button onClick={next}>Submit</button>
      <button onClick={goBack}>Back</button>
    </div>
  )
}