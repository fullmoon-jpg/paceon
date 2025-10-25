export interface User {
    id: string;
    full_name: string;
    avatar_url?: string;
    skill_level?: string;
}

export interface Post {
    _id: string;
    userId: string;
    user: User;
    content: string;
    mediaUrls: string[];
    mediaType?: 'image' | 'video';
    location?: string;
    sport?: 'tennis' | 'padel' | 'badminton' | 'other';
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    _id: string;
    postId: string;
    userId: string;
    user: User;
    content: string;
    likesCount: number;
    createdAt: string;
}

export interface ActivityFeedProps {
    currentUserId: string;
    currentUserName: string;
    avatar_url?: string;
    currentUserPosition?: string;
    currentUserCompany?: string;
    currentUserRole?: string;
    activeTab: 'all' | 'yours' | 'saved';
}