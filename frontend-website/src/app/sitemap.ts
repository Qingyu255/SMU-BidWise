import type { MetadataRoute } from 'next';
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
        url: 'https://smubidwise.com',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1,
    },
    {
        url: 'https://smubidwise.com/timetable',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
    },
    {
        url: 'https://smubidwise.com/courses',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
    },
    {
        url: 'https://smubidwise.com/bid-analytics',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    },{
        url: 'https://smubidwise.com/roadmaps',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    },
    {
        url: 'https://smubidwise.com/graduation-progress-tracker',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    },
  ];
}
