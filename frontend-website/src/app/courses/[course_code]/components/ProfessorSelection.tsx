import React from 'react';
import { Combobox } from '@/components/Combobox';
import { Separator } from '@/components/ui/separator';

interface ProfessorSelectionProps {
  professors: string[];
  onProfessorClick: (professor: string) => void;
}

const ProfessorSelection: React.FC<ProfessorSelectionProps> = ({ professors, onProfessorClick }) => {
  return (
    <div>
      {/* <Separator/> */}
      <div className='font-semibold py-2'>Filter Sections by Professor: </div>
      <Combobox selectedValue='' onSelect={(professor: string) => onProfessorClick(professor)} category='Professor' options={professors} clearOptionText='Show all'/>
    </div>
  );
};

export default ProfessorSelection;
