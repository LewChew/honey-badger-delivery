import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { COLORS, SPACING, FONT_SIZES, BADGER_PERSONALITIES } from '../../config/constants';
import { badgerService } from '../../services/badgerService';
import { selectUser } from '../../store/slices/authSlice';

// Components
import PersonalityCard from '../../components/PersonalityCard';
import CustomButton from '../../components/CustomButton';

const CreateBadgerScreen = ({ navigation }) => {
  const user = useSelector(selectUser);
  const [name, setName] = useState('');
  const [selectedPersonality, setSelectedPersonality] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreateBadger = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please give your honey badger a name!');
      return;
    }

    if (!selectedPersonality) {
      Alert.alert('Personality Required', 'Please select a personality for your honey badger!');
      return;
    }

    if (name.length < 2 || name.length > 50) {
      Alert.alert('Invalid Name', 'Name must be between 2 and 50 characters!');
      return;
    }

    setLoading(true);

    try {
      const response = await badgerService.createBadger({
        name: name.trim(),
        personality: selectedPersonality,
      });

      Alert.alert(
        'Honey Badger Created! 🦡',
        `${response.honeyBadger.name} is ready to help you achieve your goals!`,
        [
          {
            text: 'Great!',
            onPress: () => {
              navigation.navigate('BadgerDetail', {
                badgerId: response.honeyBadger.id,
                badgerName: response.honeyBadger.name,
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating badger:', error);
      Alert.alert(
        'Creation Failed',
        error.message || 'Failed to create your honey badger. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const personalityTypes = Object.keys(BADGER_PERSONALITIES);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Create Honey Badger</Text>
          <Text style={styles.headerSubtitle}>Your new motivational companion</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Badger Icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.badgerIcon}>🦡</Text>
        <Text style={styles.iconLabel}>Your New Companion</Text>
      </View>

      {/* Name Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What's your badger's name?</Text>
        <TextInput
          style={styles.nameInput}
          placeholder="Enter a name (e.g., Rocky, Badger Bob, Motivator Max)"
          placeholderTextColor={COLORS.textLight}
          value={name}
          onChangeText={setName}
          maxLength={50}
          autoCapitalize="words"
          autoCorrect={false}
        />
        <Text style={styles.characterCount}>{name.length}/50</Text>
      </View>

      {/* Personality Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose a personality</Text>
        <Text style={styles.sectionDescription}>
          Each personality has different motivational styles and approaches
        </Text>
        
        <View style={styles.personalitiesContainer}>
          {personalityTypes.map((type) => {
            const personality = BADGER_PERSONALITIES[type];
            return (
              <PersonalityCard
                key={type}
                type={type}
                personality={personality}
                selected={selectedPersonality === type}
                onPress={() => setSelectedPersonality(type)}
                style={styles.personalityCard}
              />
            );
          })}
        </View>
      </View>

      {/* Selected Personality Preview */}
      {selectedPersonality && (
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>Preview</Text>
          <View style={[
            styles.previewCard,
            { borderColor: BADGER_PERSONALITIES[selectedPersonality].color }
          ]}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewEmoji}>
                {BADGER_PERSONALITIES[selectedPersonality].emoji}
              </Text>
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>
                  {name || 'Your Badger'}
                </Text>
                <Text style={styles.previewPersonality}>
                  {BADGER_PERSONALITIES[selectedPersonality].name}
                </Text>
              </View>
            </View>
            <Text style={styles.previewDescription}>
              {BADGER_PERSONALITIES[selectedPersonality].description}
            </Text>
          </View>
        </View>
      )}

      {/* Create Button */}
      <View style={styles.buttonContainer}>
        <CustomButton
          title={loading ? 'Creating...' : 'Create Honey Badger'}
          onPress={handleCreateBadger}
          disabled={loading || !name.trim() || !selectedPersonality}
          style={styles.createButton}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  placeholder: {
    width: 40,
  },
  iconContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  badgerIcon: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  iconLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  nameInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  characterCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'right',
  },
  personalitiesContainer: {
    gap: SPACING.md,
  },
  personalityCard: {
    marginBottom: SPACING.sm,
  },
  previewSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  previewTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  previewCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderRadius: 16,
    padding: SPACING.md,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  previewEmoji: {
    fontSize: 40,
    marginRight: SPACING.md,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  previewPersonality: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  previewDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  createButton: {
    backgroundColor: COLORS.primary,
  },
});

export default CreateBadgerScreen;