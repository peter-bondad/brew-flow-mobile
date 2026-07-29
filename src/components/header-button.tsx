import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useLogout } from '@/features/auth/api';
import { Colors, Spacing } from '@/constants/theme';

export function HeaderButton() {
  const logout = useLogout();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => logout.mutate(),
        },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={styles.button}>
      <ThemedText type="smallBold" style={[styles.text, { color: Colors.light.destructive }]}>
        Sign Out
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginRight: Spacing.three,
  },
  text: {
    fontSize: 13,
  },
});
