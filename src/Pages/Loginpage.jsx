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

  // Handle Sign Up
  const handleSignUp = () => {
    if (!username || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const exists = users.find((u) => u.email === email);

    if (exists) {
      alert("User already exists with this email.");
      return;
    }

    users.push({ username, email, password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Sign Up Successful! Please Login.");
    setAction("Login");
    setUsername("");
    setEmail("");
    setPassword("");
  };

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find((u) => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      alert("Successfully logged in!");
      navigate("/home");
    } else {
      alert("Invalid credentials. Try again.");
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = () => {
    if (!email) {
      alert("Please enter your registered email first.");
      return;
    }
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find((u) => u.email === email);

    if (user) {
      alert(`Your password is: ${user.password}`);
    } else {
      alert("No account found with this email.");
    }
  };

  return (
    <div className="container">
      <div className="header" >
        <div className="text">{action}</div>
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
          Lost Password? <span onClick={handleForgotPassword}>Click Here</span>
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
