import { useState } from "react";
import axios from "axios";
import * as XLSX from 'xlsx';

function App() {
  const [msg, setmsg] = useState("");
  const [status, setstatus] = useState(false);
  const [emaillist, setEmaillist] = useState([]);

  function handlemsg(evt) {
    setmsg(evt.target.value);
  }

  function handlefile(event) {
    const file = event.target.files[0];
    console.log(file);

    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 'A' });
      const totalemaillist = excelData.map(function(item) { return item.A; });
      console.log(totalemaillist);
      setEmaillist(totalemaillist);
    };
    reader.readAsBinaryString(file);
  }

  function send() {
    setstatus(true);
    axios.post("https://bulkmail-lene.vercel.app//sendemail", { msg: msg, emaillist: emaillist })
      .then(function(data) {
        if (data.data.status === true) {
          alert("Email sent successfully");
          setstatus(false);
        } else {
          alert("failed");
          setstatus(false);
        }
      })
      .catch(function(err) {
        console.log(err);
        alert("Failed to send");
        setstatus(false);
      });
  }

  return (
    <div>
      <div className="bg-blue-950 text-white text-center">
        <h1 className="text-2xl font-medium px-5 py-3">BulkEmail</h1>
      </div>

      <div className="bg-blue-800 text-white text-center">
        <h1 className="font-medium px-5 py-3">We Can Help Your Business With Sending Multiple Emails At Once</h1>
      </div>

      <div className="bg-blue-600 text-white text-center">
        <h1 className="font-medium px-5 py-3">Drag and Drop</h1>
      </div>

      <div className="bg-blue-400 flex flex-col text-center text-black px-5 py-3">
        <textarea 
          onChange={handlemsg} 
          value={msg} 
          className="w-[80%] h-32 px-2 py-2 outline-none border border-black rounded-md" 
          placeholder="Enter The Email Text....."
        ></textarea>
      </div>

      <div className="px-5 py-3 bg-blue-400 text-center">
        <input 
          onChange={handlefile} 
          type="file" 
          className="border-4 border-dashed py-4 px-4 mt-5 mb-5"
        ></input>
      </div>

      <div className="px-5 py-3 text-center bg-blue-400">
        <p>Total Emails in the file: {emaillist.length}</p>
        <button 
          onClick={send} 
          className="bg-blue-900 text-white py-2 px-6 rounded-md font-medium mt-3"
        >
          {status ? "sending..." : "send"}
        </button>
       
      </div>
       <div className="px-5 py-8 text-center bg-blue-500"></div>
        <div className="px-5 py-8 text-center bg-blue-700"></div>
    </div>
  );
}

export default App;