import { GroupList } from "../../resources/Groups";
import {Breadcrumbs} from "../../resources/Navigation";

export default function UserGroups() {
  return (
    <div className="d-flex flex-column gap-10">
      <Breadcrumbs path="Dashboard/Groups" />
      <GroupList />
    </div>
  );
}