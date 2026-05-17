import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../styles/theme';

import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// App screens
import HomeScreen from '../screens/HomeScreen';
import VehiclesScreen from '../screens/VehiclesScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BookAppointmentStep1Screen from '../screens/BookAppointmentStep1Screen';
import BookAppointmentStep2Screen from '../screens/BookAppointmentStep2Screen';
import BookAppointmentStep3Screen from '../screens/BookAppointmentStep3Screen';
import AddVehicleScreen from '../screens/AddVehicleScreen';
import ComplaintsScreen from '../screens/ComplaintsScreen';
import OrdersScreen from '../screens/OrdersScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AppointmentFeedbackScreen from '../screens/AppointmentFeedbackScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import InvoicesScreen from '../screens/InvoicesScreen';
import InvoiceDetailScreen from '../screens/InvoiceDetailScreen';
import RepairOrdersScreen from '../screens/RepairOrdersScreen';
import RepairOrderDetailScreen from '../screens/RepairOrderDetailScreen';

const Stack = createNativeStackNavigator();

const screenOptions = { headerShown: false };

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Vehicles" component={VehiclesScreen} />
            <Stack.Screen name="Appointments" component={AppointmentsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen 
              name="BookAppointmentStep1" 
              component={BookAppointmentStep1Screen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen 
              name="BookAppointmentStep2" 
              component={BookAppointmentStep2Screen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen 
              name="BookAppointmentStep3" 
              component={BookAppointmentStep3Screen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
            <Stack.Screen name="Complaints" component={ComplaintsScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="RepairOrders" component={RepairOrdersScreen} />
            <Stack.Screen name="RepairOrderDetail" component={RepairOrderDetailScreen} />
            <Stack.Screen name="Invoices" component={InvoicesScreen} />
            <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="AppointmentFeedback" component={AppointmentFeedbackScreen} />
            <Stack.Screen name="Chatbot" component={ChatbotScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
