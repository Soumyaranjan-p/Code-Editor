/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import './App.css'
import io from 'socket.io-client'
import Editor  from '@monaco-editor/react'
import toast, { Toaster } from 'react-hot-toast';

const socket= io("http://localhost:5001")

const App = () => {
   const [joined,setJoined] =useState(false);
   const [roomId,setRoomId] =useState("");
   const [userName,setUserName]=useState("");
   const [language,setLanguage]=useState("javascript");
 const [code,setCode]=useState("");
 const [CopySuccess,setCopySuccess]=useState("");
 const [users,setUsers]=useState([]);
 const [typing, setTyping] = useState("");
 useEffect(() => {
  socket.on("userJoined", (users) => {
    setUsers(users);
  });

  socket.on("codeUpdate", (newCode) => {
    setCode(newCode);
  });

  socket.on("userTyping", (user) => {
    setTyping(`${user.slice(0, 8)}... is Typing`);
    setTimeout(() => setTyping(""), 2000);
  });

  socket.on("languageUpdate", (newLanguage) => {
    setLanguage(newLanguage);
  });

  return () => {
    socket.off("userJoined");
    socket.off("codeUpdate");
    socket.off("userTyping");
    socket.off("languageUpdate");
  };
}, []);
useEffect(() => {
  const handleBeforeUnload = () => {
    socket.emit("leaveRoom");
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, []);
   
const joinRoom = () => {
  if (roomId && userName) {
    socket.emit("join", { roomId, userName });
    setJoined(true);
  }
};

const leaveRoom = () => {
  socket.emit("leaveRoom");
  setJoined(false);
  setRoomId("");
  setUserName("");
  setCode("// start code here");
  setLanguage("javascript");
};
    const copyRoomId= () =>{
      toast.success("Room Id is Copied");
  
    navigator.clipboard.writeText(roomId);
    setCopySuccess("");
    setTimeout(() => setCopySuccess(""), 2000) 
  };
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName });
  };
    const handleLanguageChange = (e) => {
      const newLanguage = e.target.value;
      setLanguage(newLanguage);
      socket.emit("languageChange", { roomId, language: newLanguage });
    };

   if (!joined) {
    return (
      <div className="join-container  flex items-center justify-center h-[100vh]">
        <div className="join-form flex flex-col w-[300px] p-[2rem] gap-[1rem] rounded-3xl  ">
          <h1 className=' font-bold text-[#333]'>Join Code Room</h1>
          <input className='w-[100%]'
            type="text"
            placeholder="Room Id"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <button  className="bg-red-700 px-3 py-2 rounded-full  hover:bg-sky-700 " onClick={joinRoom}>Join Room</button>
        </div>
        <div>
        
      </div>
      </div>
    );
  }
 
   return <div className='editor-container '>
    <div className="sidebar">
      <div className="room-info">
        <h2 className='text-2xl text-black font-bold'>Code Room:{roomId}</h2>
        <button className='px-[5px] py-[1px] bg-sky-400 rounded-sm' onClick={copyRoomId} >
          Copy Id</button>
                       
          { CopySuccess && <span className='copy-success'> {CopySuccess}</span>}

<Toaster />
      </div>
      <h3 className='text-1xl text-black font-semibold'> Users in Room:</h3>
      <ul>
        {
          users.map((user,index) => (
            <li key={index}>{user.slice(0,8)}...</li>
          )) }
      </ul>
      <p className='typing-indicator'>{typing}</p>

      <select className='language-selector' 
      value={language} 
      onChange={handleLanguageChange} >
        <option value="javascript">Javascript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="c++">Cpp</option>
      </select>
      <button onClick={leaveRoom} className='leave-button'>Leave Room</button>
    </div>
    <div className='editor-wrapper'>
      <Editor
       height={"100%"}
       defaultLanguage={language} 
      value={code}
      language={language}
       onChange={handleCodeChange}
       theme='vs-dark'
       options={
        {
          minimap:{enabled:false},
          fontSize:14,
        }
       }
      />

    </div>
   </div>
}

export default App
