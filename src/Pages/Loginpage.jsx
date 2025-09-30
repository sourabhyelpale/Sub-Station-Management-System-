import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Loginpage.css";
import user_icon from "../assets/person.png";
import password_icon from "../assets/passward.png";
import email_icon from "../assets/Email.png";

const LoginPage = () => {
  const [action, setAction] = useState("Sign Up");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUp = () => {
    if (!username || !email || !password) {
      alert("Please fill all fields");
      return;
    }
    const userData = { username, email, password };
    localStorage.setItem("user", JSON.stringify(userData));
    alert("Sign Up Successful! Please Login.");
    setAction("Login");
    setUsername("");
    setEmail("");
    setPassword("");
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // Example check (replace with your actual login logic)
    if (true) {
      alert("Successfully login");
      navigate("/home"); // 👈 redirects to HomePage
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>

      <div className="inputs">
        {action === "Login" ? null : (
          <div className="input">
            <img src={user_icon} alt="" />
            <input
              type="text"
              placeholder="UserName"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        )}

        <div className="input">
          <img src={email_icon} alt="" />
          <input
            type="email"
            placeholder="Email Id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input">
          <img src={password_icon} alt="" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      {action === "Sign Up" ? null : (
        <div className="forgot-password">
          Lost Password? <span>Click Here</span>
        </div>
      )}

      <div className="submit-container">
        {action === "Sign Up" ? (
          <div className="submit" onClick={handleSignUp}>
            Sign Up
          </div>
        ) : (
          <div className="submit" onClick={handleLogin}>
            Login
          </div>
        )}

        <div
          className="submit gray"
          onClick={() => setAction(action === "Sign Up" ? "Login" : "Sign Up")}
        >
          {action === "Sign Up" ? "Switch to Login" : "Switch to Sign Up"}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
