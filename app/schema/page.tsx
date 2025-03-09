"use client";
import React, { Fragment, useState, useEffect } from "react";
import AddSchemaModal from "../components/AddSchemaModal";
import EditSchemaModal from "../components/EditSchemaModal";
import axios from "axios";

interface Schema {
  id: number;
  name: string;
  description: string;
  schemaText: string;
  fileName: string;
}

const Schema = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchemas = async () => {
      try {
        const { data } = await axios.get<Schema[]>("/api/schema");
        setSchemas(data);
      } catch (err) {
        setError("Gagal mengambil data skema.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchemas();
  }, []);

  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <Fragment>
      <div className="max-w-4xl mx-auto mt-6">
        <h2 className="text-2xl font-bold mb-4">Daftar Skema</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">Nama Skema</th>
              <th className="border border-gray-300 px-4 py-2">Deskripsi</th>
              <th className="border border-gray-300 px-4 py-2">Edit</th>
            </tr>
          </thead>
          <tbody>
            {schemas.map((schema) => (
              <tr key={schema.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {schema.id}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {schema.name}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {schema.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <button onClick={() => setShowAddModal(true)}>Tambah Skema</button>
      </div>
      <AddSchemaModal
        isVisible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      <EditSchemaModal
        isVisible={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </Fragment>
  );
};

export default Schema;
