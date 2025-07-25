import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role,setRole] = useState('user');
  const [batch, setBatch] = useState('Batch 1');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('All fields are required.');
      return;
    }

    try {
      await axios.post('https://aptitude-ohar.onrender.com/api/auth/register', {
        name,
        email,
        password,
        role,
        batch
      });
      alert('Registered successfully! Please login.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Registration failed.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2 className='register'>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form className='form-box'>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <select
          value={batch}
          name="batch"
          onChange={(e) => setBatch(e.target.value)}
          style={{ width: '100%', marginBottom: '10px' }}
        >
          <option value="Batch 1">Batch 1</option>
          <option value="Batch 2">Batch 2</option>
        </select>
        <button onClick={handleRegister} style={{ width: '100%' }}>Register</button>
        <p style={{ marginTop: '10px' }}>
          Already have an account? <a href="/login">Login here</a>
        </p>
      </form>
    </div>
  );
}
