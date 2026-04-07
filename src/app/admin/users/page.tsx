import { adminGetUsers } from "@/actions/adminUserActions"
import AdminUserClient from "./AdminUserClient"

export default async function AdminUsersPage() {
  const users = await adminGetUsers()

  return (
    <div>
      <AdminUserClient initialUsers={users} />
    </div>
  )
}
