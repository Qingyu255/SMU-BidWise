// utils/slugify.ts

export const unslugify = (slug: string): string => {
    return decodeURIComponent(slug);
  };