import {Breadcrumbs} from "../../resources/Navigation";

export default function UserGroups() {
  return (
    <div>
      <Breadcrumbs path="Dashboard/Groups" />
      <h1>Groups Home Page</h1>
      <h2>Needs implementation</h2>
      <a href="https://github.com/r2pen2/Citrus-React/issues/90">
        Github: Implement Dashboard/Groups #90
      </a>
      <ul>
        <li>
          <a href="/dashboard/groups/join">Join Group</a>
        </li>
        <li>
          <a href="/dashboard/groups/new">New Group</a>
        </li>
        <li>
          <a href="/dashboard/groups/group?id=exampleID">
            Group Dashboard for id=exampleID
          </a>
        </li>
      </ul>
    </div>
  );
}