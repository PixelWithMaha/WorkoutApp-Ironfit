import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { ProgressChart } from 'react-native-chart-kit';
import { colors } from '../theme/colors';
import { useStepContext } from '../context/StepContext';

const { width } = Dimensions.get('window');

const progressData = {
  labels: ["Goal"], // optional
  data: [0.6]
};

export default function ProgressScreen() {
  const { currentSteps } = useStepContext();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Progress</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Feather name="share-2" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Stay Active Card */}
        <View style={styles.stayActiveCard}>
          <Text style={styles.stayActiveTitle}>Stay Active!</Text>
          <Text style={styles.stayActiveDesc}>See your steps and progress{'\n'}this week.</Text>
          <TouchableOpacity style={styles.viewSummaryButton}>
            <Text style={styles.viewSummaryText}>View Summary</Text>
            <View style={styles.summaryIconCircle}>
              <Feather name="arrow-up-right" size={16} color={colors.white} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Summary Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>This Week's Summary</Text>
          <TouchableOpacity><Text style={styles.seeAll}>see all</Text></TouchableOpacity>
        </View>

        <View style={styles.summaryGrid}>
          {/* Steps */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <Text style={styles.summaryCardTitle}>Steps</Text>
              <Feather name="more-horizontal" size={16} color={colors.textSecondary} />
            </View>
            <View style={styles.summaryCardBody}>
              <View>
                <Text style={styles.summaryCardValue}>{currentSteps}</Text>
                <Text style={styles.summaryCardUnit}>Steps</Text>
              </View>
              <FontAwesome5 name="running" size={24} color={colors.primary} />
            </View>
          </View>

          {/* Calories */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <Text style={styles.summaryCardTitle}>Calories</Text>
              <Feather name="more-horizontal" size={16} color={colors.textSecondary} />
            </View>
            <View style={styles.summaryCardBody}>
              <View>
                <Text style={styles.summaryCardValue}>2.9</Text>
                <Text style={styles.summaryCardUnit}>Kcal</Text>
              </View>
              <Ionicons name="flame" size={24} color={colors.calories} />
            </View>
          </View>

          {/* Heart Rate */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <Text style={styles.summaryCardTitle}>Heart Rate</Text>
              <Feather name="more-horizontal" size={16} color={colors.textSecondary} />
            </View>
            <View style={styles.summaryCardBody}>
              <View>
                <Text style={styles.summaryCardValue}>76</Text>
                <Text style={styles.summaryCardUnit}>Bpm</Text>
              </View>
              <Ionicons name="heart" size={24} color={colors.heart} />
            </View>
          </View>

          {/* Workout */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <Text style={styles.summaryCardTitle}>Workout</Text>
              <Feather name="more-horizontal" size={16} color={colors.textSecondary} />
            </View>
            <View style={styles.summaryCardBody}>
              <View>
                <Text style={styles.summaryCardValue}>3h 20m</Text>
                <Text style={styles.summaryCardUnit}>Steady</Text>
              </View>
              <Ionicons name="time" size={24} color="#34C759" />
            </View>
          </View>
        </View>

        {/* My Goal Section */}
        <Text style={styles.sectionTitle}>My Goal</Text>
        
        <View style={styles.goalContainer}>
          <View style={styles.goalCard}>
            <View style={styles.progressRingContainer}>
              <ProgressChart
                data={progressData}
                width={150}
                height={150}
                strokeWidth={16}
                radius={50}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  color: (opacity = 1) => `rgba(26, 11, 46, ${opacity})`,
                }}
                hideLegend={true}
              />
              <View style={styles.progressRingLabelContainer}>
                <Text style={styles.progressRingValue}>60%</Text>
              </View>
            </View>
            <Text style={styles.goalFooterDesc}>You're 60% closer to your goal.{'\n'}Keep pushing the finish line is...</Text>
          </View>
          <View style={styles.emptyCard} />
        </View>
        
        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  stayActiveCard: {
    backgroundColor: '#E5E5EA',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  stayActiveTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  stayActiveDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  viewSummaryButton: {
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  viewSummaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  summaryIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryCardTitle: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  summaryCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  summaryCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  summaryCardUnit: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  goalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalCard: {
    width: '55%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  emptyCard: {
    width: '40%',
    backgroundColor: colors.white,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  progressRingContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressRingLabelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  goalFooterDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
