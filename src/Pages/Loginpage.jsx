import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser, getUserByEmail } from "../services/firestoreService";
import "./Loginpage.css";

const LoginPage = () => {
  const [action, setAction] = useState("Login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const isSignup = action === "Sign Up";

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
  };

  const handleSignUp = async (event) => {
    event.preventDefault();

    if (!username || !email || !password) {
      alert("Please fill all fields.");
      return;
    }

    const exists = await getUserByEmail(email);

    if (exists) {
      alert("User already exists with this email.");
      return;
    }

    try {
      await createUser({ username, email, password });
      alert("Sign up successful. Please login.");
      setAction("Login");
      resetForm();
    } catch (error) {
      console.error("Sign up failed", error);
      alert("Unable to create account. Please try again.");
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const user = await getUserByEmail(email);

      if (user && user.password === password) {
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        navigate("/home");
        return;
      }

      alert("Invalid credentials. Try again.");
    } catch (error) {
      console.error("Login failed", error);
      alert("Unable to login. Please try again.");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your registered email first.");
      return;
    }

    const user = await getUserByEmail(email);

    if (user) {
      alert(`Your password is: ${user.password}`);
    } else {
      alert("No account found with this email.");
    }
  };

  const switchAction = () => {
    setAction(isSignup ? "Login" : "Sign Up");
    resetForm();
  };

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="brand-chip">MSEDCL Operations</div>
        <div className="brand-logo-wrap">
          <img
            src="https://image.winudf.com/v2/image1/Y29tLm1zZWRjbC5hcHBfaWNvbl8xNTU1NTExMjI2XzA4Mg/icon.png?w=312&fakeurl=1"
            alt="MSEDCL logo"
          />
        </div>
        <h1>Electricity Problem Tracking System</h1>
        <p>
          Monitor station issues, report outages, and keep restoration records organized from one
          control dashboard.
        </p>
        <div className="auth-highlights">
          <div>
            <span>Live</span>
            <p>Problem map</p>
          </div>
          <div>
            <span>Fast</span>
            <p>Report entry</p>
          </div>
          <div>
            <span>Excel</span>
            <p>Export ready</p>
          </div>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <p>{isSignup ? "Create secure access" : "Welcome back"}</p>
            <h2>{isSignup ? "Create Account" : "Login to Dashboard"}</h2>
          </div>

          <div className="auth-toggle" aria-label="Authentication mode">
            <button
              className={!isSignup ? "selected" : ""}
              onClick={() => setAction("Login")}
              type="button"
            >
              Login
            </button>
            <button
              className={isSignup ? "selected" : ""}
              onClick={() => setAction("Sign Up")}
              type="button"
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={isSignup ? handleSignUp : handleLogin} className="auth-form">
            {isSignup && (
              <label className="auth-field">
                <span>User name</span>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </label>
            )}

            <label className="auth-field">
              <span>Email address</span>
              <input
                type="email"
                placeholder="admin@msedcl.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {!isSignup && (
              <button type="button" className="forgot-link" onClick={handleForgotPassword}>
                Forgot password?
              </button>
            )}

            <button type="submit" className="auth-submit">
              {isSignup ? "Create Account" : "Login"}
            </button>
          </form>

          <p className="switch-copy">
            {isSignup ? "Already have an account?" : "New operator?"}
            <button type="button" onClick={switchAction}>
              {isSignup ? "Login here" : "Create account"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
