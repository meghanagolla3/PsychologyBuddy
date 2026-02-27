import StudentLayout from "../../../src/components/StudentDashboard/Layout/StudentLayout";
import StudentProfile from "@/src/components/StudentDashboard/Profile/StudentProfile";

export default function Profile() {
  return (
    <StudentLayout title="Profile">
      <StudentProfile />
    </StudentLayout>
  )
}
