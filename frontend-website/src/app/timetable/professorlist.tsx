// src/components/ProfessorList.js
import React from 'react';



const professorListStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '20px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  maxWidth: '600px',
  margin: '20px auto',
  textAlign: 'center',
};

const headingStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#333',
  marginBottom: '20px',
};

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
};

const listItemStyle: React.CSSProperties = {
  marginBottom: '15px',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#007BFF',
  color: '#fff',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '5px',
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
};

const buttonHoverStyle: React.CSSProperties = {
  backgroundColor: '#0056b3',
};

function ProfessorList({ professors, onSelect }: any) {
  const handleMouseOver = (e: any) => {
    e.target.style.backgroundColor = buttonHoverStyle.backgroundColor;
  };

  const handleMouseOut = (e: any) => {
    e.target.style.backgroundColor = buttonStyle.backgroundColor;
  };

  return (
    <div style={professorListStyle}>
      <h2 style={headingStyle}>Select a Professor</h2>
      <ul style={listStyle}>
        {professors.map((professor: any) => (
          <li key={professor.id} style={listItemStyle}>
            <button
              style={buttonStyle}
              onClick={() => onSelect(professor)}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              {professor.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProfessorList;
