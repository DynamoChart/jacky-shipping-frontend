"use client";

import {
  Table,
  Spinner,
  EmptyState,
  Modal,
  Button,
  Input,
  Chip
} from "@heroui/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Pencil, TrashBin } from "@gravity-ui/icons";
import { toast } from "react-toastify";
import { Autocomplete, ListBox } from "@heroui/react";
const ITEMS_PER_PAGE = 8;

const columns = [
  { id: "plantId", name: "Plant ID" },
  { id: "name", name: "Name" },
  { id: "location", name: "Location" },
  { id: "status", name: "Status" },
  { id: "actions", name: "Actions" },
];

const statusColorMap = {
  Operational: "success",
  Maintenance: "warning",
  Inactive: "danger",
};

export default function Plant() {
  const [plants, setPlants] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    plantId: "",
    name: "",
    location: "",
    status: "Operational",
  });
  const statuses = [
    { id: "Operational", name: "Operational" },
    { id: "Maintenance", name: "Maintenance" },
    { id: "Inactive", name: "Inactive" },
  ];
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const isLoadingRef = useRef(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // ================= FETCH =================
  const fetchPlants = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/plants");
      const data = await res.json();

      const formatted = data.map((p) => ({
        id: p._id,
        plantId: p.plantId,
        name: p.name,
        location: p.location,
        status: p.status,
      }));

      setPlants(formatted);
      setItems(formatted.slice(0, ITEMS_PER_PAGE));
    } catch {
      toast.error("Failed to fetch plants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  const hasMore = items.length < plants.length;

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoadingMore(true);

    setTimeout(() => {
      setItems((prev) =>
        plants.slice(0, prev.length + ITEMS_PER_PAGE)
      );
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }, 800);
  }, [hasMore, plants]);

  // ================= ADD =================
  const handleAdd = async () => {
    console.log("palnt submited",form)
    try {
      const res = await fetch("http://localhost:5000/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Plant created");
      fetchPlants();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/plants/${selectedPlant.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) throw new Error();

      toast.success("Plant updated");
      setSelectedPlant(null);
      fetchPlants();
    } catch {
      toast.error("Update failed");
    }
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:5000/api/plants/${deleteId}`, {
        method: "DELETE",
      });

      toast.success("Plant deleted");
      setDeleteId(null);
      fetchPlants();
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
      {/* ================= ADD ================= */}
      <Modal>
        <Modal.Trigger>
          
          <Button variant="soft"  className="mb-4 bg-success-soft flex items-center gap-2 ">
            <Plus /> Add New Plant
          </Button>
        </Modal.Trigger>

        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Add Plant</Modal.Heading>
              </Modal.Header>

              <Modal.Body className="flex flex-col gap-3">
                <Input
                  placeholder="Plant ID"
                  onChange={(e) =>
                    setForm({ ...form, plantId: e.target.value })
                  }
                />
                <Input
                  placeholder="Name"
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
                <Input
                  placeholder="Location"
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
               <div>
  <Autocomplete
    placeholder="Select status"
    selectionMode="single"
    onChange={(value) => {
      setForm((prev) => ({ ...prev, status: value }));
    }}
  >
    <Autocomplete.Trigger>
      <Autocomplete.Value />
      <Autocomplete.ClearButton />
      <Autocomplete.Indicator />
    </Autocomplete.Trigger>

    <Autocomplete.Popover>
      <ListBox>
        {statuses.map((s) => (
          <ListBox.Item key={s.id} id={s.id}>
            {s.name}
            <ListBox.ItemIndicator />
          </ListBox.Item>
        ))}
      </ListBox>
    </Autocomplete.Popover>
  </Autocomplete>
</div>
              </Modal.Body>

              <Modal.Footer>
                <Button onClick={handleAdd}>Create</Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* ================= TABLE ================= */}
      <Table className="max-h-[400px]" aria-label="Plant table">
        <Table.ScrollContainer className="max-h-[400px] overflow-y-auto">
          <Table.Content className="min-w-[700px]">

            <Table.Header>
              {columns.map((col) => (
                <Table.Column
                  key={col.id}
                  isRowHeader={col.id === "plantId"}
                >
                  {col.name}
                </Table.Column>
              ))}
            </Table.Header>

            <Table.Body
              renderEmptyState={() => (
                <EmptyState>No Plants</EmptyState>
              )}
            >
              <Table.Collection items={items}>
                {(plant) => (
                  <Table.Row key={plant.id}>
                    <Table.Cell>{plant.plantId}</Table.Cell>
                    <Table.Cell>{plant.name}</Table.Cell>
                    <Table.Cell>{plant.location}</Table.Cell>

                    <Table.Cell>
                      <Chip
                        color={statusColorMap[plant.status]}
                        variant="soft"
                      >
                        {plant.status}
                      </Chip>
                    </Table.Cell>

                    <Table.Cell>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedPlant(plant);
                            setForm(plant);
                          }}
                        >
                          <Pencil />
                        </button>

                        <button
                          onClick={() => setDeleteId(plant.id)}
                        >
                          <TrashBin />
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Collection>

              {!!hasMore && (
                <Table.LoadMore
                  isLoading={isLoadingMore}
                  onLoadMore={loadMore}
                >
                  <Spinner />
                </Table.LoadMore>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      {/* ================= EDIT ================= */}
      {selectedPlant && (
        <Modal>
          <Modal.Backdrop
            isOpen
            onOpenChange={() => setSelectedPlant(null)}
          >
            <Modal.Container>
              <Modal.Dialog>
                <Modal.Header>
                  <Modal.Heading>Edit Plant</Modal.Heading>
                </Modal.Header>

                <Modal.Body className="flex flex-col gap-3">
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                  <Input
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                  />
                <Autocomplete
  className="w-full"
  placeholder="Select status"
  selectionMode="single"
  value={form.status}
  onChange={(value) => {
    setForm((prev) => ({ ...prev, status: value }));
  }}
>
  <Autocomplete.Trigger>
    <Autocomplete.Value />
    <Autocomplete.ClearButton />
    <Autocomplete.Indicator />
  </Autocomplete.Trigger>

  <Autocomplete.Popover>
    <ListBox>
      {statuses.map((s) => (
        <ListBox.Item key={s.id} id={s.id} textValue={s.name}>
          {s.name}
          <ListBox.ItemIndicator />
        </ListBox.Item>
      ))}
    </ListBox>
  </Autocomplete.Popover>
</Autocomplete>
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
          <Modal.Backdrop
            isOpen
            onOpenChange={() => setDeleteId(null)}
          >
            <Modal.Container>
              <Modal.Dialog>
                <Modal.Header>
                  <Modal.Heading>Delete Plant?</Modal.Heading>
                </Modal.Header>

                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={() => setDeleteId(null)}
                  >
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={handleDelete}>
                    Delete
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      )}
    </>
  );
}