// This section is used in admin/manage-user page
"use client";

import { useState } from "react";
import { User } from "@frontend/admin/manage-user/types/user";
import { Button } from "@/components/ui/button";
import { FilterByRoleDropdown } from "../components/FilterByRoleDropdown";
import { UserTable } from "../components/UserTable";
import AddAccountModal from "../components/addAccountModal";
import EditAccountModal from "../components/editAccountModal";
import { ConfirmationDialog } from "@frontend/components/ConfirmationDialog";
import { useUserActions } from "@frontend/admin/manage-user/hooks/useUserAction";

export const UserTableSection = () => {
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const { handleDeleteUser } = useUserActions();

  const handleConfirmDelete = async () => {
    const success = await handleDeleteUser(userToDelete!.id);
    if (success) {
      setUserToDelete(null);
    }
  };

  return (
    <section className="container max-w-screen-xl mx-auto mt-6 flex flex-col items-center justify-center space-y-10">
      <div className="flex justify-end w-full">
        <FilterByRoleDropdown />
      </div>

      <UserTable
        onEditUser={(user) => setUserToEdit(user)}
        onDeleteUser={(user) => setUserToDelete(user)}
      />

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={() => setShowAddModal(true)}
          className="mr-2 bg-blue-600 hover:bg-blue-700"
        >
          Tambah Pengguna
        </Button>
      </div>

      {showAddModal && (
        <AddAccountModal isVisible={showAddModal} onClose={() => setShowAddModal(false)} />
      )}

      {userToEdit && (
        <EditAccountModal
          isVisible={true}
          onClose={() => setUserToEdit(null)}
          user={{
            id: userToEdit.id,
            fullName: userToEdit.name,
            email: userToEdit.email,
            status: userToEdit.isActive ? "Aktif" : "Nonaktif",
            role: userToEdit.role
          }}
        />
      )}

      {userToDelete && (
        <ConfirmationDialog
          isOpen={true}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleConfirmDelete}
          description="Apakah Anda yakin ingin menghapus pengguna ini?"
        />
      )}
    </section>
  );
};
