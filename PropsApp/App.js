
import RootNavigation from './src/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';

const auth = getAuth();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return subscriber;
  },[]);
  if (initializing) return null;
  return (
     <RootNavigation user={user}/>
  );
}
export default App;