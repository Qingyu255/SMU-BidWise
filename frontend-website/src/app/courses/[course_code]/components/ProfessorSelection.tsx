import React from 'react';
import { Combobox } from '@/components/Combobox';

interface ProfessorSelectionProps {
  professors: string[];
  onProfessorClick: (professor: string) => void;
}

const ProfessorSelection: React.FC<ProfessorSelectionProps> = ({ professors, onProfessorClick }) => {
  return (
    <div className='w-fit'>
      {/* <Separator/> */}
      <div className='font-semibold py-2 w-fit'>Filter Sections by Professor: </div>
      <Combobox selectedValue='' onSelect={(professor: string) => onProfessorClick(professor)} category='Professor' options={professors} clearOptionText='Show all'/>
    </div>
  );
};

export default ProfessorSelection;
