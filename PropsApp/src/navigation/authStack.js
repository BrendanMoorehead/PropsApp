//When user is not logged in
import { View, Text } from 'react-native'
import React from 'react'

import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SignInScreen from '../screens/SignIn';
import SignUpScreen from '../screens/SignUp';

const Stack = createStackNavigator();

const authStack = () => {
  return (
    <NavigationContainer>
        <Stack.Navigator
            initialRouteName='SignUp'
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Sign In" component={SignInScreen}/>
            <Stack.Screen name="Sign Up" component={SignUpScreen}/>
        </Stack.Navigator>
    </NavigationContainer>
  )
}

export default authStack