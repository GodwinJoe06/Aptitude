import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setAuthToken } from '../utils/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

const handleLogin = async () => {
  try {
    const response = await axios.post('https://aptitude-4ycu.onrender.com/api/auth/login', {
      email,
      password
    });

    const { token, user } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('role', user.role);

    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/user');
    }

  } catch (err) {
    console.error('Login failed:', err);
  }
};


  return (
    <div>
      <h2>Login</h2>
      <input placeholder="email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
