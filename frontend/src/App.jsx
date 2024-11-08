import axios from 'axios';
import {Calendar} from "@nextui-org/calendar";
import {parseDate} from '@internationalized/date';

const apiCall = () => {
  axios.get('http://localhost:8080').then((data) => {
    console.log(data)
  })
}

function App() {

  return (
    <>
    <div className="flex gap-x-4">
      <Calendar aria-label="Date (No Selection)" />
      <Calendar aria-label="Date (Uncontrolled)" defaultValue={parseDate("2020-02-03")} />
      <button onClick={apiCall}>Make API Call</button>
    </div>
    </>
  )
}

export default App
