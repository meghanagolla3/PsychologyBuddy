import StudentLayout from "../../../src/components/StudentDashboard/Layout/StudentLayout";
import MoodSelector from '../../../src/components/StudentDashboard/MoodCheckIn/MoodCheckin'

export default function MoodCheckinPage() {
  return (
    <StudentLayout title="Daily Mood Check-in">
      <MoodSelector />
    </StudentLayout>
  )
}
