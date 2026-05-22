import { useStore } from "_store";

export default function useTheme() {
    const {
        main: { isDarkMode, darkModeLoaded },
        actions: { setDarkMode }
    } = useStore();

    return {
        isDarkMode,
        darkModeLoaded,
        actions: { setDarkMode }
    };
}
