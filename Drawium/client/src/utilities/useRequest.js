import useSwr from 'swr';


export const useRequest = (path) => {
    if (!path) {
        throw new Error('Path is required');
    }

    const url =  path;
    const { data, error } = useSwr(url, { refreshInterval: 1500 });

    return { data, error };
};