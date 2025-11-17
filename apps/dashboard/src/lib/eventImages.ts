export const EVENT_IMAGES: Record<string, string> = {
  tennis: '/images/tennis.webp',
  padel: '/images/padel.webp',
  badminton: '/images/badminton.webp',
  coffee_chat: '/images/caffeechat.webp',
  workshop: '/images/workshop.webp',
  meetup: '/images/meetup.webp',
  social: '/images/social.webp',
  other: '/images/other.webp',
};

export const getEventImage = (eventType: string): string => {
  return EVENT_IMAGES[eventType] || EVENT_IMAGES.other;
};
