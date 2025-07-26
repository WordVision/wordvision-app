import { useNavigation } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

/**
 * Executes a callback when the user navigates away from the screen or backgrounds the app.
 *
 * This hook abstracts the complexity of listening to both React Navigation's `beforeRemove` event
 * and React Native's `AppState` change event to provide a single, reliable trigger for
 * "exit" scenarios.
 *
 * @param onExitCallback - The function to execute when an exit event is detected.
 * @returns {void} This hook does not return a value.
 *
 * @example
 * // Inside your component:
 * const [text, setText] = useState('');
 *
 * const handleSaveDraft = useCallback(() => {
 * saveDraftToStorage(text);
 * }, [text]);
 *
 * // The hook is called with the function to run on exit.
 * useOnExitScreen(handleSaveDraft);
 *
 * @note This hook uses a `useRef` to store the callback, ensuring that the event listeners
 * are not re-registered on every render, which is an efficient pattern for this use case.
 */
export function useOnExitScreen(onExitCallback: () => void): void {

  const navigation = useNavigation();

  const callbackRef = useRef(onExitCallback);
  useEffect(() => {
    callbackRef.current = onExitCallback;
  }, [onExitCallback]);

  useEffect(() => {
    // When the screen loses focus (e.g., user navigates away)
    const unsubscribeBeforeRemove = navigation.addListener('beforeRemove', () => {
      callbackRef.current();
    });

    // When user closes or backgrounds the app
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        callbackRef.current();
      }
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeBeforeRemove();
      subscription.remove();
    };

  }, [navigation]);
}
