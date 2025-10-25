export const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

export const uploadImages = async (files: File[], userId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of files) {
        const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', userId);

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                if (data.success && data.url) {
                    uploadedUrls.push(data.url);
                }
            } catch (error) {
        console.error('Error uploading image:', error);
        }
    }

    return uploadedUrls;
};
