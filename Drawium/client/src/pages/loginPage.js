import React from "react";
import discord from  "../images/discord.svg";



export default function Loginpage() {
  

 return (
   <div className="">
     <div id="JumbotronLoginPage" class="d-none d-xs-none d-sm-none d-md-flex">
      <div className="container-fluid py-5">
        <p id="appName">Drawium</p>
        <div id="loginButtons">
        <a href="https://discord.com/api/oauth2/authorize?client_id=913118520160698458&redirect_uri=https%3A%2F%2Fwww.drawium.lol%2Flogin&response_type=code&scope=identify" className="btn btn-lg fw-bold" type="button" id="login"><img src={discord} alt="discord.svg" id="discord"></img>&nbsp;Login</a>
        <a href="/login?guestLogin=guest" className="btn btn-lg fw-bold" type="button" id="login">Guest Login</a>
        </div>
      </div>
    </div>
    <div className="container-fluid py-5" class="d-md-none" id="loginPageMobile">
        <p id="appName">Drawium</p>
        <div id="loginButtonsMobile">
        <a href="https://discord.com/api/oauth2/authorize?client_id=913118520160698458&redirect_uri=https%3A%2F%2Fwww.drawium.lol%2Flogin&response_type=code&scope=identify" className="btn btn-lg fw-bold" type="button" id="login"><img src={discord} alt="discord.svg" id="discord"></img>&nbsp;Login</a>
        <a href="/login?guestLogin=guest" className="btn btn-lg fw-bold" type="button" id="login">Guest Login</a>
        </div>
      </div>
   </div>
 );
 }