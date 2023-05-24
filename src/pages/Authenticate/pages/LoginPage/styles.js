import { StyleSheet } from 'react-native';
import {
  font,
  getWidthPercentage,
  getHeightPercentage
} from '../../../../common/Helper';
import colors from '../../../../common/Colors';

const LoginPageStyle = StyleSheet.create({
    imageContainer: {
        marginTop: getHeightPercentage(3),
        alignItems: 'center',
    },
    loginBackgroundContainer: {
        flex: 1
    },
    loginBackgroundImage: {
        resizeMode: 'contain',
        width: getWidthPercentage(100),
    },
    logoImageStyles: {
        height: getHeightPercentage(20),
        width: getWidthPercentage(70),
        resizeMode: 'contain'
    },
    loginContainer: {
       backgroundColor: colors.lightWhite,
       height: getHeightPercentage(43),
       marginLeft: 10,
       marginRight: 10,
       width: getWidthPercentage(95),
    },
    emailContainer: {
        paddingTop: 30,
    },
    label: {
        ...font(14, 'Regular'),
        color: colors.black,
        fontWeight: '400',
        paddingLeft: 25
    },
    image: {
        width: getWidthPercentage(100),
        height: getHeightPercentage(100),
        resizeMode: 'contain',
        flex: 1
    },
    title: {
        ...font(18, 'Bold'),
        textAlign: 'center',
        color: colors.white,
    },
    buttonContainer: {
        marginTop: 60,
        marginLeft: 23,
        marginRight: 23,
        position: 'absolute',
        bottom: 10
    },
    loginButton : {
        backgroundColor: colors.primary,
        height: getHeightPercentage(6.5),
        width: getWidthPercentage(86),
        justifyContent: 'center',
        borderRadius: 4,
    },
    loginButtonWithOpacity: {
        backgroundColor: colors.primary,
        height: getHeightPercentage(6.5),
        width: getWidthPercentage(86),
        justifyContent: 'center',
        borderRadius: 4,
        opacity: 0.5
    },
    infoContainer: {
        paddingHorizontal: 10,
        paddingVertical: 20
    },
    infoText: {
        textAlign: 'center',
        ...font(18),
        color: colors.black,
        marginLeft: 10,
        marginRight: 10
    },
  });

export default LoginPageStyle;
