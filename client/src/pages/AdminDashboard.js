import React, { useEffect, useState } from 'react';
import axios from 'axios';

const downloadCSV = async () => {
  try {
    const response = await fetch('https://aptitude-ohar.onrender.com/api/admin/results/download');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'user-assessment-report.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Download failed:", error);
  }
};


const AdminResults = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    axios.get('https://aptitude-ohar.onrender.com/api/admin/results')
      .then(res => setResults(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <button onClick={downloadCSV}>Download CSV</button>
      <h2>Users' Results</h2>
      {results.map(user => (
        <div key={user.name} style={{ marginBottom: 30 }}>
          <h4>{user.name} - Score: {user.score}/{user.answers.length}</h4>
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Question</th>
                <th>User Answer</th>
                <th>Correct Answer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {user.answers.map((ans, idx) => (
                <tr key={idx}>
                  <td>{ans.question}</td>
                  <td>{ans.userAnswer}</td>
                  <td>{ans.adminAnswer}</td>
                  <td style={{ color: ans.isCorrect ? 'green' : 'red' }}>
                    {ans.isCorrect ? 'Correct' : 'Wrong'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default AdminResults;
