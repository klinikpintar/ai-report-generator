"use client";
import React, { Fragment, useState } from "react";
import AddSchemaModal from "../components/AddSchemaModal";
import EditSchemaModal from "../components/EditSchemaModal";

const Schema = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <Fragment>
      <div>
        <button onClick={() => setShowAddModal(true)}>Tambah Skema</button>
      </div>
      <AddSchemaModal
        isVisible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      <div>
        <button onClick={() => setShowEditModal(true)}>Edit Skema</button>
      </div>
      <EditSchemaModal
        isVisible={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </Fragment>
  );
};

export default Schema;
