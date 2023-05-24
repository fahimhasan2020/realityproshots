import React, {Component} from 'react';
import {createSwitchNavigator, createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {createDrawerNavigator} from 'react-navigation-drawer';
import {Provider} from 'react-redux';
import PAGES from './src/pages';
import {getWidthPercentage} from './src/common/Helper';
import AppDrawer from './src/common/navigation/AppDrawer';
import configureStore from './src/AppStore';
import {Text, TextInput} from 'react-native';
import Toast from 'react-native-toast-message';

const store = configureStore();

const LandingStackNavigator = createStackNavigator(
  {
    LandingPage: {
      screen: PAGES.LandingPage,
    },
  },
  {
    headerMode: 'none',
    initialRouteName: 'LandingPage',
    navigationOptions: {
      gestureEnabled: false,
    },
  },
);

const AuthNavigator = createStackNavigator(
  {
    LoginPage: {
      screen: PAGES.LoginPage,
    },
  },
  {
    headerMode: 'none',
    initialRouteName: 'LoginPage',
    defaultNavigationOptions: {
      gestureEnabled: false,
      swipeEnabled: false,
    },
    navigationOptions: {
      gestureEnabled: false,
      drawerLockMode: 'locked-closed',
    },
  },
);

const DashboardNavigator = createStackNavigator(
  {
    HomePage: {
      screen: PAGES.HomePage,
    },
    AddProjectPage: {
      screen: PAGES.AddProjectPage,
    },
    CameraPage: {
      screen: PAGES.CameraPage,
    },
    ShowCapturedImagePage: {
      screen: PAGES.ShowCapturedImagePage,
    },
    ViewProjectPage: {
      screen: PAGES.ViewProjectPage,
    },
    SubmitProjectPage: {
      screen: PAGES.SubmitProjectPage,
    },
    ContactPage: {
      screen: PAGES.ContactPage,
    },
    PlayVideoPage: {
      screen: PAGES.PlayVideoPage,
    },
    PrivacyPage: {
      screen: PAGES.PrivacyPage,
    },
  },
  {
    headerMode: 'none',
    initialRouteName: 'HomePage',
    defaultNavigationOptions: {
      gestureEnabled: false,
      swipeEnabled: false,
    },
    navigationOptions: {
      gestureEnabled: false,
      drawerLockMode: 'locked-closed',
    },
  },
);

const AppDrawerNavigator = createDrawerNavigator(
  {
    stack: {
      screen: DashboardNavigator,
    },
  },
  {
    headerMode: 'none',
    contentComponent: AppDrawer,
    drawerWidth: getWidthPercentage(84.6),
    contentOptions: {
      activeTintColor: 'white',
      inactiveTintColor: 'rgba(255, 255, 255, 0.5)',
    },
  },
);

const AppStack = createStackNavigator(
  {
    AppDrawerNavigator,
  },
  {
    initialRouteName: 'AppDrawerNavigator',
    headerMode: 'none',
    defaultNavigationOptions: {
      gestureEnabled: false,
      swipeEnabled: false,
    },
    navigationOptions: {
      headerVisible: false,
      drawerLockMode: 'locked-closed',
    },
  },
);

const AppSwitchNavigator = createSwitchNavigator(
  {
    IntroPage: PAGES.IntroPage,
    SplashPage: PAGES.SplashPage,
    LandingNavigator: LandingStackNavigator,
    AppNavigator: AppStack,
    AuthNavigator: AuthNavigator,
  },
  {
    initialRouteName: 'SplashPage',
  },
);

const AppContainer = createAppContainer(AppSwitchNavigator);

export default class MainApp extends Component {
  constructor(props) {
    super(props);
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.allowFontScaling = false;
    TextInput.defaultProps = TextInput.defaultProps || {};
    TextInput.defaultProps.allowFontScaling = false;
  }

  render() {
    return (
      <Provider store={store}>
        <AppContainer />
        <Toast />
      </Provider>
    );
  }
}
