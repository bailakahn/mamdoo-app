import React from 'react';
import { Text, View } from 'react-native';
import {
  DrawerContentScrollView,
  createDrawerNavigator 
} from '@react-navigation/drawer';
import ClientRoutes from "../../client/index"; 
import {
  useTheme,
  TouchableRipple, 
  Switch,
} from 'react-native-paper';
import { Classes } from "_styles";
import { PreferencesContext } from '../../../context/preferencesContext';
import { t } from "_utils/lang";
const Drawer = createDrawerNavigator();


function DrawerContent() {
  const { colors } = useTheme();

  const {themeName, toggleTheme } = React.useContext(
    PreferencesContext
  );
    return (
      <DrawerContentScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View
        style={Classes.container(colors) && { justifyContent: "space-between" }}
      >
        <TouchableRipple onPress={toggleTheme}>
          <View style={Classes.drawerPreference(colors)}>
            <Text style={{ color: colors.text }}> {t("main.darkTheme")}</Text>
            <View pointerEvents="none">
              <Switch color={"#3adb76"} value={themeName === "dark"} />
            </View>
          </View>
        </TouchableRipple>
      </View>
    </DrawerContentScrollView>
    );
  }
 const  DrawerNavigator = () => {
    return (
        <Drawer.Navigator
        drawerContent={() => <DrawerContent />}
        > 
        <Drawer.Screen
         name="Param"
         children={() => <ClientRoutes />}

         />
    </Drawer.Navigator>
    );
  }


  export default DrawerNavigator;
  
