import React from 'react';

interface ProfessorButtonsProps {
  professors: string[];
  onProfessorClick: (professor: string) => void;
}

const ProfessorButtons: React.FC<ProfessorButtonsProps> = ({ professors, onProfessorClick }) => {
  return (
    <div>
      <h2>Select a Professor</h2>
      <div>
        {professors.map((professor, index) => (
          <button key={index} onClick={() => onProfessorClick(professor)} 
          style={{
            margin: '10px',
            padding: '12px 24px',
            fontSize: '16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#0070f3',
            color: '#ffffff',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}>
            {professor}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfessorButtons;
