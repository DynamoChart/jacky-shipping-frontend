"use client";

import {
  Table,
  Modal,
  Button,
  Input,
  Spinner,
  EmptyState,
  Chip
} from "@heroui/react";
import { useEffect, useState } from "react";
import { Plus, Pencil, TrashBin } from "@gravity-ui/icons";
import { toast } from "react-toastify";
import BulkUpload from "./BulkUpload";
export default function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    skuId: "",
    name: "",
    category: "",
    stock: 0,
    unitPrice: 0,
    description: "",
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // ================= FETCH =================
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/skus`);
      const data = await res.json();
      setItems(data);
      console.log("items",data)
    } catch {
      toast.error("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ================= ADD =================
  const handleAdd = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/skus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
  
      const data = await res.json(); // 👈 important
  
      if (!res.ok) throw new Error(data.message);
  
      toast.success("Item created");
  
      // 🔥 IMPORTANT: don't rely on stale state
      fetchItems();
  
    } catch (err) {
      toast.error(err.message || "Create failed");
    }
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/skus/${selectedItem._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) throw new Error();

      toast.success("Updated");
      setSelectedItem(null);
      fetchItems();
    } catch {
      toast.error("Update failed");
    }
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/skus/${deleteId}`, {
        method: "DELETE",
      });

      toast.success("Deleted");
      setDeleteId(null);
      fetchItems();
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner size="sm" />
      </div>
    );
  }

  return (
    <>
    <div className="flex justify-between">
      {/* ================= ADD ================= */}
    
      <Modal>
        <Modal.Trigger>
        <Button variant="soft"  className="mb-4 bg-success-soft flex items-center gap-2 ">
            <Plus /> Add New Item
          </Button>
        </Modal.Trigger>

        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Add SKU</Modal.Heading>
              </Modal.Header>

              <Modal.Body className="flex flex-col gap-3">
                <Input placeholder="SKU ID"
                  onChange={(e) => setForm({ ...form, skuId: e.target.value })} />
                <Input placeholder="Name"
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input placeholder="Category"
                  onChange={(e) => setForm({ ...form, category: e.target.value })} />
                <Input type="number" placeholder="Stock"
                  onChange={(e) => setForm({ ...form, stock: +e.target.value })} />
                <Input type="number" placeholder="Unit Price"
                  onChange={(e) => setForm({ ...form, unitPrice: +e.target.value })} />
                <Input placeholder="Description"
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Modal.Body>

              <Modal.Footer>
                <Button onClick={handleAdd}>Create</Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
      <BulkUpload onSuccess={fetchItems} />
      </div>
      {/* ================= TABLE ================= */}
      <Table className="max-h-[400px]" aria-label="SKU table">
  <Table.ScrollContainer className="max-h-[400px] overflow-y-auto">
    <Table.Content className="min-w-[700px]">

      {/* HEADER */}
      <Table.Header>
        <Table.Column isRowHeader>SKU</Table.Column>
        <Table.Column>Name</Table.Column>
        <Table.Column>Category</Table.Column>
        <Table.Column>Stock</Table.Column>
        <Table.Column>Price</Table.Column>
        <Table.Column>Actions</Table.Column>
      </Table.Header>

      {/* BODY */}
      <Table.Body
        renderEmptyState={() => (
          <EmptyState>No Items</EmptyState>
        )}
      >
        <Table.Collection
  items={items.map((item) => ({
    ...item,
    key: item._id || item.skuId, // 🔥 REQUIRED
  }))}
>
          {(item) => (
            <Table.Row key={item._id || item.skuId}>
              <Table.Cell>{item.skuId}</Table.Cell>
              <Table.Cell>{item.name}</Table.Cell>
              <Table.Cell>{item.category}</Table.Cell>

              <Table.Cell>
                <Chip>{item.stock}</Chip>
              </Table.Cell>

              <Table.Cell>${item.unitPrice}</Table.Cell>

              <Table.Cell>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setForm(item);
                    }}
                  >
                    <Pencil />
                  </button>

                  <button onClick={() => setDeleteId(item._id)}>
                    <TrashBin />
                  </button>
                </div>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Collection>
      </Table.Body>

    </Table.Content>
  </Table.ScrollContainer>
</Table>

      {/* ================= EDIT ================= */}
      {selectedItem && (
        <Modal>
          <Modal.Backdrop isOpen onOpenChange={() => setSelectedItem(null)}>
            <Modal.Container>
              <Modal.Dialog>
                <Modal.Header>
                  <Modal.Heading>Edit SKU</Modal.Heading>
                </Modal.Header>

                <Modal.Body className="flex flex-col gap-3">
                  <Input value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <Input value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })} />
                  <Input type="number" value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: +e.target.value })} />
                  <Input type="number" value={form.unitPrice}
                    onChange={(e) => setForm({ ...form, unitPrice: +e.target.value })} />
                </Modal.Body>

                <Modal.Footer>
                  <Button onClick={handleUpdate}>Save</Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      )}

      {/* ================= DELETE ================= */}
      {deleteId && (
        <Modal>
          <Modal.Backdrop isOpen onOpenChange={() => setDeleteId(null)}>
            <Modal.Container>
              <Modal.Dialog>
                <Modal.Header>
                  <Modal.Heading>Delete Item?</Modal.Heading>
                </Modal.Header>

                <Modal.Footer>
                  <Button onClick={handleDelete}>Delete</Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      )}
    </>
  );
}