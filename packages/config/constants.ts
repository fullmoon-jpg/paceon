export const ENVIRONMENT_CONFIG = {
    development: {
        landing: 'http://localhost:3000',
        dashboard: 'http://localhost:3001'
    },
    production: {
        landing: 'https://paceon.id',
        dashboard: 'https://app.paceon.id'
    }
} as const;

export const getAppUrl = (app: 'landing' | 'dashboard'): string => {
    const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
    return ENVIRONMENT_CONFIG[env][app];
};

// Helper functions
export const getDashboardUrl = (path: string = ''): string => {
    return `${getAppUrl('dashboard')}${path}`;
};

export const getLandingUrl = (path: string = ''): string => {
    return `${getAppUrl('landing')}${path}`;
};