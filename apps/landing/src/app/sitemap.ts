import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://paceon.id',
      lastModified: new Date(),
    },
    {
      url: 'https://paceon.id/Talk-n-Tales',
      lastModified: new Date(),
    },
  ];
}
