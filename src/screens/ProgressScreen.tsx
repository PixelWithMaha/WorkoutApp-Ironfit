import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import { colors } from '../theme/colors';
import { useStepContext } from '../context/StepContext';
import { Modal, ActivityIndicator } from 'react-native';
import { useHistory } from '../hooks/useHistory';

const { width } = Dimensions.get('window');

const progressData = {
  labels: ["Goal"], // optional
  data: [0.6]
};

export default function ProgressScreen() {
  const { currentSteps, currentCalories, currentDistance } = useStepContext();
  const { weeklyData, loading: historyLoading } = useHistory();
  const [summaryVisible, setSummaryVisible] = React.useState(false);

  // Calculate goal progress (default 10k steps)
  const stepGoal = 10000;
  const progressPercent = Math.min((currentSteps / stepGoal), 1);
  const displayPercent = Math.round(progressPercent * 100);

  const progressData = {
    labels: ["Goal"],
    data: [progressPercent]
  };

  // Prepare chart data from weekly history
  const chartData = {
    labels: weeklyData.length > 0 ? weeklyData.map(d => d.weekLabel.split(' ')[0]) : ["W1", "W2", "W3", "W4"],
    datasets: [{
      data: weeklyData.length > 0 ? weeklyData.map(d => d.distance) : [5, 8, 7, 12]
    }]
  };


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
        <View style={[styles.stayActiveCard, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.stayActiveTitle, { color: colors.white }]}>Stay Active!</Text>
          <Text style={[styles.stayActiveDesc, { color: 'rgba(255,255,255,0.7)' }]}>See your steps and progress{'\n'}this week.</Text>
          <TouchableOpacity style={styles.viewSummaryButton} onPress={() => setSummaryVisible(true)}>
            <Text style={styles.viewSummaryText}>View Summary</Text>
            <View style={styles.summaryIconCircle}>
              <Feather name="arrow-up-right" size={16} color={colors.white} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>This Week's Summary</Text>
          <TouchableOpacity onPress={() => setSummaryVisible(true)}><Text style={styles.seeAll}>see more</Text></TouchableOpacity>
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
                <Text style={styles.summaryCardValue}>{currentCalories}</Text>
                <Text style={styles.summaryCardUnit}>Kcal</Text>
              </View>
              <Ionicons name="flame" size={24} color={colors.calories} />
            </View>
          </View>

          {/* Distance */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <Text style={styles.summaryCardTitle}>Distance</Text>
              <Feather name="more-horizontal" size={16} color={colors.textSecondary} />
            </View>
            <View style={styles.summaryCardBody}>
              <View>
                <Text style={styles.summaryCardValue}>{currentDistance}</Text>
                <Text style={styles.summaryCardUnit}>Km</Text>
              </View>
              <Ionicons name="location" size={24} color={colors.water} />
            </View>
          </View>

          {/* Workout */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <Text style={styles.summaryCardTitle}>Intensity</Text>
              <Feather name="more-horizontal" size={16} color={colors.textSecondary} />
            </View>
            <View style={styles.summaryCardBody}>
              <View>
                <Text style={styles.summaryCardValue}>{currentSteps > 5000 ? 'High' : 'Low'}</Text>
                <Text style={styles.summaryCardUnit}>Active</Text>
              </View>
              <Ionicons name="stats-chart" size={24} color="#34C759" />
            </View>
          </View>
        </View>

        {/* Summary Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={summaryVisible}
          onRequestClose={() => setSummaryVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Weekly Summary</Text>
                <TouchableOpacity onPress={() => setSummaryVisible(false)}>
                  <Feather name="x" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={styles.chartLabel}>Distance Trends (Last 4 Weeks)</Text>
                {historyLoading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <LineChart
                    data={chartData}
                    width={width - 64}
                    height={200}
                    chartConfig={{
                      backgroundColor: colors.white,
                      backgroundGradientFrom: colors.white,
                      backgroundGradientTo: colors.white,
                      decimalPlaces: 1,
                      color: (opacity = 1) => `rgba(18, 1, 92, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(142, 142, 147, ${opacity})`,
                      style: { borderRadius: 16 },
                      propsForDots: { r: "5", strokeWidth: "2", stroke: colors.primary }
                    }}
                    bezier
                    style={{ marginVertical: 8, borderRadius: 16, alignSelf: 'center' }}
                  />
                )}

                <Text style={[styles.chartLabel, { marginTop: 20 }]}>Metrics Overview</Text>
                <View style={styles.modalMetricsGrid}>
                  <View style={styles.modalMetricItem}>
                    <Ionicons name="footsteps" size={24} color={colors.primary} />
                    <View style={styles.modalMetricText}>
                      <Text style={styles.modalMetricLabel}>Total Steps</Text>
                      <Text style={styles.modalMetricValue}>{currentSteps}</Text>
                    </View>
                  </View>
                  <View style={styles.modalMetricItem}>
                    <Ionicons name="flame" size={24} color={colors.calories} />
                    <View style={styles.modalMetricText}>
                      <Text style={styles.modalMetricLabel}>Total Calories</Text>
                      <Text style={styles.modalMetricValue}>{currentCalories} Kcal</Text>
                    </View>
                  </View>
                  <View style={styles.modalMetricItem}>
                    <Ionicons name="location" size={24} color={colors.water} />
                    <View style={styles.modalMetricText}>
                      <Text style={styles.modalMetricLabel}>Total Distance</Text>
                      <Text style={styles.modalMetricValue}>{currentDistance} Km</Text>
                    </View>
                  </View>
                  <View style={styles.modalMetricItem}>
                    <Ionicons name="heart" size={24} color={colors.heart} />
                    <View style={styles.modalMetricText}>
                      <Text style={styles.modalMetricLabel}>Avg Heart Rate</Text>
                      <Text style={styles.modalMetricValue}>76 Bpm</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.summaryStatsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Avg Steps</Text>
                    <Text style={styles.statValue}>5.4K</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Avg Dist</Text>
                    <Text style={styles.statValue}>4.2 Km</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Active Days</Text>
                    <Text style={styles.statValue}>5/7</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.closeButton} onPress={() => setSummaryVisible(false)}>
                  <Text style={styles.closeButtonText}>Done</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>


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
                  backgroundColor: colors.white,
                  backgroundGradientFrom: colors.white,
                  backgroundGradientTo: colors.white,
                  color: (opacity = 1) => `rgba(18, 1, 92, ${opacity})`,
                }}
                hideLegend={true}
              />
              <View style={styles.progressRingLabelContainer}>
                <Text style={styles.progressRingValue}>{displayPercent}%</Text>
              </View>
            </View>
            <Text style={styles.goalFooterDesc}>You're {displayPercent}% closer to your goal.{'\n'}Keep pushing the finish line is...</Text>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  chartLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 16,
  },
  modalMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalMetricItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalMetricText: {
    marginLeft: 12,
  },
  modalMetricLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  modalMetricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
