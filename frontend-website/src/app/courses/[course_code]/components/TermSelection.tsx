import React from 'react';
import { Combobox } from '@/components/Combobox';
import { TermObjType } from '@/utils/supabase/supabaseRpcFunctions';

interface TermSelectionProps {
  termObjects: TermObjType[];
  latestTermSelected: string
  onTermSelect: (termName: string, termId: string) => void;
}

const TermSelection: React.FC<TermSelectionProps> = ({ termObjects, latestTermSelected, onTermSelect }) => {
  const termOptionToIdMap: any = {};
  termObjects.forEach(obj => {
    termOptionToIdMap[obj.term] = obj.id;
  })
  const termOptionsArr = Object.keys(termOptionToIdMap);
  return (
    <div className='w-fit'>
      {/* <Separator/> */}
      <div className='font-semibold py-2 w-fit'>Filter Sections by Term:</div>
      <Combobox selectedValue={latestTermSelected} onSelect={(selectedTerm: string) => onTermSelect(selectedTerm, termOptionToIdMap[selectedTerm])} category='Term' options={termOptionsArr} hideClearText={true}/>
    </div>
  );
};

export default TermSelection;
