import React from "react";
import { Route, Routes} from "react-router-dom";
import { SocketContext, socket } from "../src/utilities/sockets";
import "bootstrap/dist/css/bootstrap.css";

import Loginpage from '../src/pages/loginPage';
import Navbar from "../src/pages/navbar";
import Mainpage from '../src/pages/mainPage';
import Drawpage from "../src/pages/drawPage";
import Profilepage from "../src/pages/profilePage";


function App() {
 


  return (
    <div>
      <SocketContext.Provider value={socket}>
     <Navbar />
     <Routes>  
       <Route path="/lobby" element={<Mainpage />}></Route>
       <Route path="/login" element={<Mainpage />}></Route>
       <Route path="/" element={<Loginpage  />}></Route>
       <Route path="/draw" element={<Drawpage/>}></Route>
       <Route path="/profile" element={<Profilepage/>}></Route>
    
     </Routes>
     </SocketContext.Provider>
   </div>
  );
}

export default App;
