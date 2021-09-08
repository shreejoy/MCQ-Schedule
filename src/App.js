import './App.css';
import contributors from './data/contributors.json';
import timetable from './data/timetable.json';
import topics from './data/topics.json';

function getTopicName(codeName) {
  return topics.find(topic => topic.code === codeName).name;
}

function App() {
  return (
    <div>
      <h1>MCQ Schedule for AUG 30 2021 to SEPT 12 2021</h1>
      <hr />
      <h3>Moderator of the week: Suman More (SM)</h3>
      <h1>Schedule</h1>
      <table>
        <thead>
          <tr>
            <th>DAY</th>
            <th>SLOT 1</th>
            <th>SLOT 2</th>
            <th>SLOT 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Monday</td>
            <td>{getTopicName(timetable.MON.S1.topic)} ({timetable.MON.S1.assignee})</td>
            <td>{getTopicName(timetable.MON.S2.topic)} ({timetable.MON.S2.assignee})</td>
            <td>{getTopicName(timetable.MON.S3.topic)} ({timetable.MON.S3.assignee})</td>
          </tr>
          <tr>
            <td>Tuesday</td>
            <td>{getTopicName(timetable.TUE.S1.topic)} ({timetable.TUE.S1.assignee})</td>
            <td>{getTopicName(timetable.TUE.S2.topic)} ({timetable.TUE.S2.assignee})</td>
            <td>{getTopicName(timetable.TUE.S3.topic)} ({timetable.TUE.S3.assignee})</td>
          </tr>
          <tr>
            <td>Wednesday</td>
            <td>{getTopicName(timetable.WED.S1.topic)} ({timetable.WED.S1.assignee})</td>
            <td>{getTopicName(timetable.WED.S2.topic)} ({timetable.WED.S2.assignee})</td>
            <td>{getTopicName(timetable.WED.S3.topic)} ({timetable.WED.S3.assignee})</td>
          </tr>
          <tr>
            <td>Thursday</td>
            <td>{getTopicName(timetable.THU.S1.topic)} ({timetable.THU.S1.assignee})</td>
            <td>{getTopicName(timetable.THU.S2.topic)} ({timetable.THU.S2.assignee})</td>
            <td>{getTopicName(timetable.THU.S3.topic)} ({timetable.THU.S3.assignee})</td>
          </tr>
          <tr>
            <td>Friday</td>
            <td>{getTopicName(timetable.FRI.S1.topic)} ({timetable.FRI.S1.assignee})</td>
            <td>{getTopicName(timetable.FRI.S2.topic)} ({timetable.FRI.S2.assignee})</td>
            <td>{getTopicName(timetable.FRI.S3.topic)} ({timetable.FRI.S3.assignee})</td>
          </tr>
          <tr>
            <td>Saturday</td>
            <td>{getTopicName(timetable.SAT.S1.topic)} ({timetable.SAT.S1.assignee})</td>
            <td>{getTopicName(timetable.SAT.S2.topic)} ({timetable.SAT.S2.assignee})</td>
            <td>{getTopicName(timetable.SAT.S3.topic)} ({timetable.SAT.S3.assignee})</td>
          </tr>
          <tr>
            <td>Sunday</td>
            <td>{getTopicName(timetable.SUN.S1.topic)} ({timetable.SUN.S1.assignee})</td>
            <td>{getTopicName(timetable.SUN.S2.topic)} ({timetable.SUN.S2.assignee})</td>
            <td>{getTopicName(timetable.SUN.S3.topic)} ({timetable.SUN.S3.assignee})</td>
          </tr>
        </tbody>
      </table>
      <h1>Contributors</h1>
      <ul>
        {contributors.map(contributor => (
          <li key={contributor.code}>{contributor.name} ({contributor.code})</li>
        ))}
      </ul>
      <h1>Slots</h1>
      <ul>
        <li>SLOT 1 (6AM - 11AM)</li>
        <li>SLOT 2 (12PM - 5PM)</li>
        <li>SLOT 3 (6PM - 11PM)</li>
      </ul>
    </div>
  );
}

export default App;
