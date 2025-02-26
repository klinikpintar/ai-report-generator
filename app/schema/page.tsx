"use client";
import React, { Fragment, useState } from "react";
import AddSchemaModal from "../components/AddSchemaModal";

const Schema = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <Fragment>
      <div>
        <button onClick={() => setShowModal(true)}>Tambah Skema</button>
      </div>
      <AddSchemaModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
      />
    </Fragment>
  );
};

export default Schema;
