
import RootNavigation from './src/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from './src/config/firebaseConfig';
import { PickBadgeValueProvider } from './src/contexts/PickBadgeContext';

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const subscriber = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return subscriber;
  },[]);
  if (initializing) return null;
  return (
    <PickBadgeValueProvider>
     <RootNavigation user={user}/>
    </PickBadgeValueProvider>
  );
}
export default App;