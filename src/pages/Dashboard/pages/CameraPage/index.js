'use strict';
import React, { PureComponent } from 'react';
import {
  View,
  Text,
  Image,
  Platform,
  StatusBar,
  Vibration,
  TouchableOpacity,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import styles from './styles';
import { getData, saveData } from '../../../../common/Helper';
import images from '../../../../common/Images';
import GridViewComponent from '../../../Dashboard/components/GridView';
import { withNavigation, NavigationEvents } from 'react-navigation';
import {
  SensorTypes,
  accelerometer,
  setUpdateIntervalForType,
} from 'react-native-sensors';
import KeepAwake from 'react-native-keep-awake';
import Orientation from 'react-native-orientation-locker';

setUpdateIntervalForType(SensorTypes.accelerometer, 700);

class CameraPage extends PureComponent {
  constructor(props) {
    super(props);
    this.subscription = null;
    this.state = {
      dataUri: [],
      lensTypes: [],
      showRed: false,
      disableViberate: false,
      showGrid: true,
      selectedLens: null,
      selectedLensIndex: 0,
      btnEnabled: false,
      exposureValue: -1,
      isSnapping: false,
      orientation: null,
      showTimer: false,
      timerCount: 3
    };
  }

  componentDidMount() {
    Orientation.getDeviceOrientation(this.deviceOrientationListener);
    Orientation.addDeviceOrientationListener(this.deviceOrientationListener);
  }

  componentWillUnmount() {
    Orientation.removeDeviceOrientationListener(this.deviceOrientationListener);
    KeepAwake.deactivate();
    Vibration.cancel();
    if (!this.unsubscribe) {
      this.subscription.unsubscribe();
    }
  }

  deviceOrientationListener = (orientationType) => {
    let orientationval = this.state.orientation;
    switch (orientationType) {
      case 'PORTRAIT':
        orientationval = 'portrait';
        break;
      case 'LANDSCAPE-LEFT':
        orientationval = 'landscapeRight';
        break;
      case 'LANDSCAPE-RIGHT':
        orientationval = 'landscapeLeft';
        break;
      case 'PORTRAIT-UPSIDEDOWN':
        orientationval = 'portraitUpsideDown';
        break;
    }
    this.setState({ orientation: orientationval });
  };

  handleDidFocus = async () => {
    console.log('did focus called!');
    Orientation.lockToPortrait();
    this.resetStates();
    KeepAwake.activate();
    this.subscription = accelerometer.subscribe(({ x, y, z }) => {
      this.checkDeviceLevels(x.toFixed(2), y.toFixed(2), z.toFixed(2));
    });
    let data = await getData('PROPERTIES');
    const lastCam = await getData('LASTCAM');
    const lastCamIndex = await getData('LASTCAMINDEX');
    if (lastCam) {
      this.setState({
        selectedLens: lastCam,
        selectedLensIndex: lastCamIndex,
      });
    }
    const propertAddress = this.props.navigation.getParam('property');
    if (data) {
      data = JSON.parse(data);
      const selectedProperty = data.find(
        (item) => item.title === propertAddress,
      );
      if (selectedProperty) {
        this.setState({ btnEnabled: true });
      } else {
        this.setState({ btnEnabled: false });
      }
    }
  };

  handleWillBlur = () => {
    console.log('did blur called!');
    KeepAwake.deactivate();
    Vibration.cancel();
    if (!this.unsubscribe) {
      this.subscription.unsubscribe();
    }
  };

  resetStates = () => {
    this.setState({
      dataUri: [],
      isSnapping: false,
      exposureValue: -1,
    });
  };

  onCameraReady = async () => {
    const ids = await this.camera.getCameraIdsAsync();
    let lensTypes = [];
    if (Platform.OS === 'ios') {
      lensTypes = ids.filter((lensType) => lensType.type === 1);
    } else {
      lensTypes = ids.filter((lensType) => lensType.type !== 1);
    }
    console.log('lensTypes: ', lensTypes);
    this.setState({ lensTypes });
    const lastCam = await getData('LASTCAM');
    if (!lastCam) {
      lensTypes.map((lensType, index) => {
        if (
          lensType.hasOwnProperty('deviceType') &&
          lensType.deviceType.includes('UltraWide') !== -1
        ) {
          saveData('LASTCAM', lensType.id);
          saveData('LASTCAMINDEX', index);
          this.setState({ selectedLens: lensType.id, selectedLensIndex: index });
        } else {
          console.log('nopes !!!');
        }
      });
    } else {
    }
  };

  checkDeviceLevels = (x, y, z) => {
    const { showRed, disableViberate, isSnapping } = this.state;
    if (Platform.OS === 'ios') {
      if ((y > -0.02 && y < 0.02) || (x < 0.02 && x > -0.02)) {
        if (!showRed) {
          if (!isSnapping && !disableViberate) {
            Vibration.vibrate();
            this.setState({ disableViberate: true });
          }
          this.setState({ showRed: true });
        }
      } else {
        console.log('viberate false');
        this.setState({ showRed: false });
        if ((y < -0.05 || y > 0.05) && (x > 0.05 || x < -0.05)) {
          this.setState({ disableViberate: false });
        }
      }
    } else {
      if (
        (y < 0.2 && y > -0.1 && x < 10.0 && x > 9.6 && z > -0.5) ||
        (y < 0.2 && y > -0.1 && x > -10.0 && x < -9.6 && z > -0.5) ||
        (x < 0.5 && x > -0.5 && y < 9.9 && y > 9.0) ||
        (z < 9.9 && z > 9.7) ||
        (z > -9.9 && z < -9.5)
      ) {
        if (!showRed) {
          if (!isSnapping) {
            Vibration.vibrate();
          }
          this.setState({ showRed: true });
        }
      } else {
        this.setState({ showRed: false });
      }
    }
  };

  toggleGrid = () => {
    const { showGrid } = this.state;
    this.setState({ showGrid: !showGrid });
  };

  takePicture = async () => {

    this.setState({showTimer:true});

    const intervalId = setInterval(() => {
      this.setState((prevState) => ({
        timerCount: prevState.timerCount - 1,
      }));

      if (this.state.timerCount === 0) {
        clearInterval(intervalId);
        this.setState({showTimer:false});
      }
    }, 1000);

    setTimeout(async()=>{const { navigation } = this.props;

    const projectId = navigation.getParam('projectId');
    this.setState({ isSnapping: true, });
    const data = [];
    let options = {};
    if (this.camera) {
      if (Platform.OS === 'ios') {
        options = {
          base64: true,
          quality: 0.5,
          exposure: 1,
          orientation: this.state.orientation,
        };
        let imagearray = await this.camera.takePictureAsync(options);
        options = {
          base64: true,
          quality: 0.5,
          exposure: 0,
          orientation: this.state.orientation,
        };

        let imageobj = await this.camera.takePictureAsync(options);
        data.push(imageobj.uri);

        for (let image of imagearray) {
          data.push(image.uri);
        }
      } else {
        options = {
          quality: 0.5,
        };
        let imagearray = await this.camera.takePictureAsync(options);
        for (let image of imagearray.pictures) {
          data.push(image.uri);
        }
      }
    }
    const propertAddress = navigation.getParam('property', '');
    const googleplaceId = navigation.getParam('placeId', '');
    this.props.navigation.navigate('ShowCapturedImagePage', {
      imageURL: data,
      property: propertAddress,
      placeId: googleplaceId,
      projectId: projectId,
      onBack: () => {
        this.setState({ btnEnabled: true });
      },
    });},1000);

    
  };

  donePressed = () => {
    const { navigation } = this.props;
    const propertAddress = navigation.getParam('property');
    const placeId = navigation.getParam('placeId');
    const projectId = navigation.getParam('projectId');
    console.log('cameraPage', projectId);
    // navigation.goBack();
    navigation.navigate('ViewProjectPage', {
      property: propertAddress,
      placeId: placeId,
      projectId: projectId,
    });
  };

  renderOpaquBar = (isBottom) => {
    return (
      <View
        style={isBottom ? styles.bottomBarContainer : styles.topBarContainer}
      />
    );
  };

  renderSnapButton = () => {
    return (
      <TouchableOpacity
        onPress={this.takePicture}
        style={styles.snapButtonContainer}>
        <Image source={images.snapButton} />
      </TouchableOpacity>
    );
  };

  renderDoneButton = () => {
    const { btnEnabled } = this.state;
    // const Container = btnEnabled ? TouchableOpacity : View;
    return (
      <TouchableOpacity
        onPress={this.donePressed}
        style={[
          styles.doneButtonAlt,
          //  btnEnabled ? null : styles.btnDisabled
        ]}>
        <Text style={styles.doneTextAlt}>Done</Text>
      </TouchableOpacity>
    );
  };

  renderGridButton = () => {
    const { showGrid } = this.state;
    return (
      <TouchableOpacity onPress={this.toggleGrid} style={styles.gridButton}>
        <Image source={showGrid ? images.gridIcon : images.withoutGridIcon} />
      </TouchableOpacity>
    );
  };

  renderCameraOptions = () => {
    return (
      <View style={styles.cameraTypesContainer}>
        <TouchableOpacity onPress={this.changeCamera}>
          <Image
            style={{ width: 30, height: 30 }}
            source={images.nextCameraIcon}
          />
        </TouchableOpacity>
      </View>
    );
  };

  changeCamera = () => {
    const { lensTypes, selectedLensIndex } = this.state;
    let index = selectedLensIndex + 1;
    if (selectedLensIndex === lensTypes.length - 1) {
      index = 0;
    }
    saveData('LASTCAM', lensTypes[index].id);
    saveData('LASTCAMINDEX', index);
    this.setState({
      selectedLens: lensTypes[index].id,
      selectedLensIndex: index,
    });
  };

  render() {
    const { showRed, showGrid, selectedLens } = this.state;
    return (
      <View style={styles.mainContainer}>
        <StatusBar hidden={true} />
        <NavigationEvents
          onDidBlur={this.handleWillBlur}
          onDidFocus={this.handleDidFocus}
        />
        <RNCamera
          ref={(ref) => {
            this.camera = ref;
          }}
          captureAudio={false}
          style={styles.preview}
          exposure={0.5}
          pauseAfterCapture={false}
          onCameraReady={this.onCameraReady}
          type={RNCamera.Constants.Type.back}
          ratio={'4:3'}
          cameraId={selectedLens}
          useNativeZoom={true}
          autoFocus={RNCamera.Constants.AutoFocus.on}
          flashMode={RNCamera.Constants.FlashMode.off}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
        />
        {this.state.showTimer ? <Text style={{ position: 'absolute', top: '48%', left: '45%', fontSize: 100, color: 'white', fontWeight: 'bold' }}>{this.state.timerCount}</Text> : null}

        {!showGrid ? null : <GridViewComponent showRed={showRed} />}
        {this.renderOpaquBar(false)}
        {this.renderOpaquBar(true)}
        {this.renderSnapButton()}
        {this.renderDoneButton()}
        {this.renderGridButton()}
        {this.renderCameraOptions()}
      </View>
    );
  }
}
export default withNavigation(CameraPage);
