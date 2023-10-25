// Import custom authentication hook
import { useAuth } from '../hooks/useAuth';
// Import stacks
import UserStack from './userStack';
import AuthStack from './authStack';

export default function RootNavigation() {
    // Gets whether the user is logged in or not
    const  user  = useAuth();
    // Returns the main stack if logged in, auth stack if not
    return user ? <UserStack/> : <AuthStack/>;
}