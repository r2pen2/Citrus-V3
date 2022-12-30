import { Routes, Route } from 'react-router-dom';
import { UserDetail } from "../../resources/Users";

export default function Users() {
  return (
    <div>
        <Routes>
            <Route path="*" element={<UserDetail />}/>
        </Routes>
    </div>
  )
}
