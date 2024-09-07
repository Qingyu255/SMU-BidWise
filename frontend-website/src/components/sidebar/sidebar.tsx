'use client';

import {
  CalendarDays,
  ChartArea,
  Users,
  LibraryBig,
  Map,
  Route,
  GraduationCap
} from 'lucide-react';
import { SidebarDesktop } from './sidebar-desktop';
import { SidebarItems } from '@/types';
import { SidebarButton } from './sidebar-button';
import { useMediaQuery } from 'usehooks-ts';
import { SidebarMobile } from './sidebar-mobile';

const sidebarItems: SidebarItems = {
  links: [
    { 
      label: 'Timetable',
      href: '/timetable',
      icon: CalendarDays
    },
    { 
      label: 'Courses', 
      href: '/courses', 
      icon: LibraryBig 
    },
    { 
      label: 'Bid Price Analytics', 
      href: '/bid-analytics', 
      icon: ChartArea 
    },
    { 
      label: 'VenueVision', 
      href: 'venues', 
      icon: Map 
    },
    {
      label: 'Senior Roadmaps',
      href: '/roadmaps',
      icon: Route,
    },
    {
      label: 'Graduation Progress Tracker',
      href: '/graduation-progress-tracker',
      icon: GraduationCap,
    },
    {
      label: 'Communities',
      href: '/communities',
      icon: Users,
    },
  ],
  // extras: (
  //   <div className='flex flex-col gap-2'>
  //     <SidebarButton icon={MoreHorizontal} className='w-full'>
  //       More
  //     </SidebarButton>
  //     <SidebarButton
  //       className='w-full justify-center text-white'
  //       variant='default'
  //     >
  //       Cool Feature
  //     </SidebarButton>
  //   </div>
  // ),
};

export function Sidebar() {
  const isDesktop = useMediaQuery('(min-width: 640px)', {
    initializeWithValue: false,
  });

  if (isDesktop) {
    return <SidebarDesktop sidebarItems={sidebarItems} />;
  }

  return <SidebarMobile sidebarItems={sidebarItems} />;
}
