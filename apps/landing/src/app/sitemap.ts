import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://paceon.id',
      lastModified: new Date(),
    },
    {
      url: 'https://paceon.id/talk-n-tales',
      lastModified: new Date(),
    },
  ];
}
