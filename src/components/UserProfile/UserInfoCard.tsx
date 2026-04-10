import { BackendUser } from "../../types/backend/backendUser";
import ChangePasswordModal from "./Modals/ChangePasswordModal";
import EditProfileModal from "./Modals/EditProfileModal";

interface UserMetaCardProps {
  user: BackendUser | null;
}

export default function UserInfoCard({ user }: UserMetaCardProps) {
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Información Personal
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Nombre
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.name || ""}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Apellido
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.lastname || ""}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.email || ""}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Nombre de usuario
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.username || ""}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
          <EditProfileModal user={user} />
          <ChangePasswordModal />
        </div>
      </div>
    </div>
  );
}
