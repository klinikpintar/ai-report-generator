"use client";

import { SchemaFilters, SchemaTable } from "@frontend/admin/schema/components";
import { Button } from "@/components/ui/button";
import AddSchemaModal from "@frontend/admin/schema/components/AddSchemaModal";
import Modal from "@frontend/components/Modal";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import EditSchemaModal from "../components/EditSchemaModal";
import { useSchemaActions } from "../hooks";
import { useState } from "react";
import { Schema } from "@frontend/common/types";
import { useRefreshSchema } from "../hooks/useRefreshSchema";

export const SchemaTableSection = () => {
  const [schemaToEdit, setSchemaToEdit] = useState<Schema | null>(null);
  const [schemaToDelete, setSchemaToDelete] = useState<Schema | null>(null);
  const [schemaToView, setSchemaToView] = useState<Schema | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const { handleDeleteSchema } = useSchemaActions();
  const { refreshSchemas } = useRefreshSchema();

  const handleConfirmDelete = async () => {
    const success = await handleDeleteSchema(schemaToDelete!.id);
    if (success) {
      setSchemaToDelete(null);
    }
  };

  const onAddModalClose = async () => {
    setShowAddModal(false);
    await refreshSchemas();
  };

  return (
    <>
      <SchemaFilters />

      <SchemaTable
        onEditSchema={(schema) => setSchemaToEdit(schema)}
        onDeleteSchema={(schema) => setSchemaToDelete(schema)}
        onViewSchema={(schema) => setSchemaToView(schema)}
      />

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={() => setShowAddModal(true)}
          className="mr-2 bg-[#00B0EB] hover:bg-[#00B0EB]/90"
        >
          Tambah Skema
        </Button>
      </div>

      {/* Modals */}
      {showAddModal && <AddSchemaModal isVisible={showAddModal} onClose={onAddModalClose} />}

      {schemaToEdit && (
        <EditSchemaModal
          isVisible={true}
          onClose={() => setSchemaToEdit(null)}
          schema={{
            id: schemaToEdit.id,
            name: schemaToEdit.name,
            description: schemaToEdit.description || "",
            schemaText: schemaToEdit.schemaText,
            fileName: schemaToEdit.name,
            serviceId: schemaToEdit.serviceId,
          }}
        />
      )}

      {schemaToDelete && (
        <ConfirmationDialog
          isOpen={true}
          onClose={() => setSchemaToDelete(null)}
          onConfirm={handleConfirmDelete}
          description="Apakah Anda yakin ingin menghapus skema ini?"
        />
      )}

      {schemaToView && (
        <Modal
          title={"Skema " + schemaToView.name}
          subtitle=""
          onClose={() => setSchemaToView(null)}
          isVisible={true}
          isForm={false}
        >
          <div className="p-8">
            <code className="block h-[500px] overflow-y-scroll">{schemaToView.schemaText}</code>
          </div>
        </Modal>
      )}
    </>
  );
};
