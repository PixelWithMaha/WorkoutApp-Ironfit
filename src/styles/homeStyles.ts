import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const PRIMARY_COLOR = '#12015cff'; 

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9FB',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E1E1E1',
    marginRight: 12,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#130138',
  },
  subtitle: {
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4B4B',
    borderWidth: 2,
    borderColor: 'white',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#130138',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 12,
    color: '#A0A0A0',
    marginRight: 4,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 8,
    height: 110,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 10,
  },
  barLabel: {
    fontSize: 10,
    color: '#A0A0A0',
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#130138',
  },
  seeAll: {
    fontSize: 14,
    color: '#524B6B',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  metricCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 11,
    color: '#A0A0A0',
    fontWeight: '500',
  },
  metricValueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#130138',
  },
  metricUnitText: {
    fontSize: 10,
    fontWeight: 'normal',
    color: '#A0A0A0',
  },
  workoutCard: {
    backgroundColor: '#E8E8E8',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
  },
  workoutTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#130138',
    marginBottom: 8,
  },
  workoutDesc: {
    fontSize: 13,
    color: '#524B6B',
    lineHeight: 18,
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
