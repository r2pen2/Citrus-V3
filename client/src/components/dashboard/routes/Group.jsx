import { Routes, Route } from 'react-router-dom';

import { GroupNew, GroupMembers, GroupInvite, GroupDashboard, GroupAdd } from "../../resources/Groups";

export default function Groups() {
  return (
    <div>
        <Routes>
            <Route path="*" element={<GroupDashboard />}/>
            <Route path="/invite" element={<GroupInvite />}/>
            <Route path="/members" element={<GroupMembers />}/>
            <Route path="/new" element={<GroupNew />}/>
            <Route path="/add" element={<GroupAdd />}/>
        </Routes>
    </div>
  )
}
