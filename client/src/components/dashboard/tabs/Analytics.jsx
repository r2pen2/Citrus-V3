import { Breadcrumbs } from "../../resources/Navigation";

export default function Analytics() {
  return (
    <div>
      <Breadcrumbs path="Dashboard/Analytics" />
      <h1>Analytics Page</h1>
      <h2>Needs implementation</h2>
      <a href="https://github.com/r2pen2/Citrus-React/issues/101">
        Github: Implement Dashboard/Analytics #101
      </a>
      <ul>
        <li>
          <div>Renders a series of charts/graphs to show user analytics</div>
        </li>
        <li>
          <div>Total money spent by month bar chart</div>
        </li>
        <li>
          <div>Money spent by category pie chart</div>
        </li>
      </ul>
    </div>
  );
}
