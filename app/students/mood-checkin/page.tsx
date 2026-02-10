import StudentLayout from "../../../components/StudentDashboard/Layout/StudentLayout";
import MoodSelector from '../../../components/StudentDashboard/MoodCheckIn/MoodCheckin'

export default function MoodCheckinPage() {
  return (
    <StudentLayout title="Daily Mood Check-in">
      <MoodSelector />
    </StudentLayout>
  )
}
