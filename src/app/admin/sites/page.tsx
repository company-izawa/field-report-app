import { adminGetSites } from "@/actions/adminSiteActions"
import AdminSiteClient from "./AdminSiteClient"

export default async function AdminSitesPage() {
  const sites = await adminGetSites()

  return (
    <div>
      <AdminSiteClient initialSites={sites} />
    </div>
  )
}
