import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import UserAddressCard from "../../components/userProfile/UserAddressCard";
import UserInfoCard from "../../components/userProfile/UserInfoCard";
import UserMetaCard from "../../components/userProfile/UserMetaCard";

export default function UserProfiles() {
  return (
    <>
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
          <UserAddressCard />
        </div>
      </div>
    </>
  );
}
