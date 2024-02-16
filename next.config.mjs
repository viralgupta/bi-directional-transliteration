export default () => {
    const rewrites = () => {
        return [
            {
                source: "/api/translate",
                destination: "http://localhost:8000/api/translate",
            }
        ];
    };
    return {
        rewrites,
        reactStrictMode: false
    };
};