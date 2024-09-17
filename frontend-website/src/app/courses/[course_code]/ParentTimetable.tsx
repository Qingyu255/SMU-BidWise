
import React from 'react';
import { TimetableProvider } from '../../../components/timetableProvider';
import Timetable from './Timetable';
import MyTimetable from '../../timetable/mytimetable';

const ParentTimetable: React.FC = () => {
  return (
    <TimetableProvider>
      <div>
        <Timetable />
        <MyTimetable />
      </div>
    </TimetableProvider>
  );
};

export default ParentTimetable;
