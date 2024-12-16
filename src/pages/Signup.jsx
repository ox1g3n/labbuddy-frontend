import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import React from "react";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [semester, setSemester] = useState(1); // Default to 1 and use integer
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validation checks
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/auth/signup", {
        name,
        email,
        password,
        confirmPassword,
        semester, // This is now directly an integer
      });
      navigate("/login"); // Redirect to login page after signup
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      {/* New heading section */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
          Welcome to LabBuddy
        </h1>
        <p className="text-xl text-gray-600">
        Run and Save all your Lab programs in one place. Get AI help. Ace your next lab exam!
        </p>
      </div>

      <form
        onSubmit={handleSignup}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-xl font-bold mb-4">Sign Up</h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full p-2 mb-3 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full p-2 mb-3 border rounded"
          required
        />
        {/* Semester Dropdown */}
        <select
          value={semester}
          onChange={(e) => setSemester(Number(e.target.value))}
          className="block w-full p-2 mb-3 border rounded"
          required
        >
          <option value={1}>1st Semester</option>
          <option value={2}>2nd Semester</option>
          <option value={3}>3rd Semester</option>
          <option value={4}>4th Semester</option>
          <option value={5}>5th Semester</option>
          <option value={6}>6th Semester</option>
          <option value={7}>7th Semester</option>
          <option value={8}>8th Semester</option>
        </select>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full p-2 mb-3 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="block w-full p-2 mb-3 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition duration-300"
        >
          Sign Up
        </button>
        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <a href="/" className="text-green-500 hover:underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}

export default Signup;
