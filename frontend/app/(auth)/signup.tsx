import {
  Image,
  StyleSheet,
  View,
  TextInput,
  Text,
  Pressable,
  Alert,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useState, useEffect } from "react";
import { useNavigation } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { supabase } from '@/lib/supabase'
import { makeRedirectUri } from "expo-auth-session";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Controller, useForm } from "react-hook-form";

import {z} from "zod";
import { zodResolver } from "@hookform/resolvers/zod";



export default function LandingPage() {

  const schema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email(),
    birthdate: z.date(),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });

  type FormFields = z.infer<typeof schema>

  const redirectTo = makeRedirectUri();
  const navigation = useNavigation();

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);


  const { control, handleSubmit } = useForm<FormFields>({
    defaultValues: {
      birthdate: new Date(),
    },
    resolver: zodResolver(schema)
  })

  async function signUpWithEmail(formData: FormFields) {
    setLoading(true)

    const { data: { session }, error, } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: redirectTo + "/login",
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          birthdate: formData.birthdate.toJSON(),
        }
      }
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')

    setLoading(false)
  }

  async function signUpWithGoogle() {
    Alert.alert("will be available soon...")
  }

  return (
    <View style={styles.container}>

      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.logoTitle}>WordVision</Text>
      </View>


      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ width: "100%"}}
      >
        <View style={styles.formBox} >

          <View style={styles.formHeader}>
            <Pressable onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} />
            </Pressable>

            <Text style={styles.formTitle}>Sign up</Text>
          </View>

          <ScrollView style={styles.inputGroupContainer}>

            <Controller
              control={control}
              render={({field: {onChange, onBlur, value}, fieldState: { error } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>First Name</Text>

                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />

                  {error && <Text style={styles.errorMsg}>{error.message}</Text>}
                </View>
              )}
              name="firstName"
            />

            <Controller
              control={control}
              render={({field: {onChange, onBlur, value}, fieldState: { error } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}/>
                    {error && <Text style={styles.errorMsg}>{error.message}</Text>}
                </View>
              )}
              name="lastName"
            />

            <Controller
              control={control}
              render={({field: {onChange, onBlur, value}, fieldState: { error } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Email<Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, {borderColor: error ? "red" : "black"}]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    inputMode="email"
                    autoCapitalize="none" />
                  {error && <Text style={styles.errorMsg}>{error.message}</Text>}
                </View>
              )}
              name="email"
            />

            {Platform.OS === "web" ?
              <View style={styles.inputGroup} >
                <Text style={styles.inputLabel}>
                  Birthdate<Text style={styles.required}>*</Text>
                </Text>
                <input type="date" style={styles.input}/>
              </View>
              :
              <Controller
                control={control}
                render={({field: {onChange, value}}) => (
                  <>
                  <Pressable
                    style={styles.inputGroup}
                    onPress={() => { setShowDatePicker(true)}}
                  >
                    <Text style={styles.inputLabel}>
                      Birthdate<Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      editable={false}
                      value={value ? value.toLocaleDateString() : ""}
                    />
                  </Pressable>

                  {showDatePicker &&
                    <DateTimePicker
                      testID="dateTimePicker"
                      value={value}
                      mode="date"
                      maximumDate={new Date()}
                      onChange={val => { setShowDatePicker(false); onChange(new Date(val.nativeEvent.timestamp)); }}
                    />
                  }
                  </>
                )}
                name="birthdate"
              />
            }

            <Controller
              control={control}
              render={({field: {onChange, onBlur, value}, fieldState: { error } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Password<Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, {borderColor: error ? "red" : "black"}]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry={true}
                    autoCapitalize="none" />
                  {error && <Text style={styles.errorMsg}>{error.message}</Text>}
                </View>
              )}
              name="password"
            />

            <Controller
              control={control}
              render={({field: {onChange, onBlur, value}, fieldState: { error } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Confirm Password<Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, {borderColor: error ? "red" : "black"}]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry={true}
                    autoCapitalize="none" />
                  {error && <Text style={styles.errorMsg}>{error.message}</Text>}
                </View>

              )}
              name="confirmPassword"
            />

          </ScrollView>

          <Pressable
            style={styles.submit}
            disabled={loading}
            onPress={handleSubmit(signUpWithEmail)}
          >
            <Text style={styles.buttonText}>Sign up</Text>
          </Pressable>

          <Text style={styles.buttonText}>- or -</Text>

          <Pressable style={styles.socialButton} onPress={() => signUpWithGoogle()}>
            <Image
              source={require("@/assets/images/google.png")}
              style={styles.buttonLogo} />
            <Text style={styles.buttonText}>Continue with Google</Text>
          </Pressable>
        </View>

      </KeyboardAvoidingView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    padding: 16,
    backgroundColor: "#005675",
    display: "flex",
    gap: 12,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  logoContainer: {
    marginTop: 64,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  logo: {
    height: 60,
    width: 80,
  },

  logoTitle: {
    fontFamily: "Quando_400Regular",
    color: "white",
    fontSize: 32
  },

  formBox: {
    width: "100%",
    maxHeight: 640,
    padding: 24,
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  formHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  formTitle: {
    fontFamily: "Quando_400Regular",
    color: "black",
    fontSize: 24,
  },

  inputGroupContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    maxHeight: 300,
  },

  inputGroup: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    marginBottom: 4,
  },

  inputLabel: {
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "black",
    fontSize: 16
  },

  errorMsg: {
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "#FF4A4A",
    fontSize: 12
  },

  input: {
    fontFamily: "AtkinsonHyperlegible_400Regular",
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: "black",
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 2
  },

  required: {
    color: "#FF4A4A"
  },

  submit: {
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: "#80D4FF",
    borderWidth: 1,
    borderRadius: 2
  },

  buttonText: {
    fontFamily: "AtkinsonHyperlegible_400Regular",
    textAlign: "center",
    color: "black",
    fontSize: 16,
    display: "flex",
    flexDirection: "row",
    gap: 12
  },

  socialButton: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 2
  },

  buttonLogo: {
    height: 20,
    width: 20,
    resizeMode: "cover",
  },

});
