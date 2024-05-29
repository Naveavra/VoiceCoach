import { AppNavigation } from './AppNavigation';
import { store } from './common/redux/store';
import { Provider as ReduxProvider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  
  return (
    <NavigationContainer>
      <ReduxProvider store={store}>
        <GestureHandlerRootView>
          <AppNavigation />
        </GestureHandlerRootView>
      </ReduxProvider>
    </NavigationContainer>
  );
}


