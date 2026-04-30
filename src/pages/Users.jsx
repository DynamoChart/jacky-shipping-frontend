"use client";

import {
  Chip,
  Spinner,
  Table,
  EmptyState,
  Modal,
  Button,
  Input
} from "@heroui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  PersonXmark,
  Pencil,
  TrashBin,
  Plus
} from "@gravity-ui/icons";
import { useAppContext } from "../context/DataContext";
import { toast } from "react-toastify";

import {Autocomplete, Label, Description, TagGroup, ListBox,Select} from "@heroui/react";
import { Tag} from "@heroui/react";
const statusColorMap = {
  admin: "success",
  production: "accent",
  user: "warning",
};

const ITEMS_PER_PAGE = 8;

const columns = [
  { id: "name", name: "Name" },
  { id: "role", name: "Role" },
  { id: "email", name: "Email" },
  { id: "assignedPlant", name: "Assigned Plant" },
  { id: "workingDays", name: "Working Hours" },
  { id: "actions", name: "Actions" },
];

const formatDay = (day) => ({
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
}[day] || day);

export default function Users() {
  const { token } = useAppContext();

  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const plants = [
    "Main Production Plant - California",
    "Secondary Plant - Texas",
    "EU Manufacturing Plant - Germany",
  ];
  
  const roles = [
    { id: "admin", name: "Admin" },
    { id: "production", name: "Production" },
    { id: "user", name: "User" },
  ];
  
  const days = [
    { id: "Monday", label: "Mon" },
    { id: "Tuesday", label: "Tue" },
    { id: "Wednesday", label: "Wed" },
    { id: "Thursday", label: "Thu" },
    { id: "Friday", label: "Fri" },
    { id: "Saturday", label: "Sat" },
    { id: "Sunday", label: "Sun" },
  ];
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedDays, setSelectedDays] = useState(
    new Set(["Monday", "Tuesday"])
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "user",
    password: ""
  });

  const isLoadingRef = useRef(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // ================= FETCH =================
  const fetchUsers = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        const formatted = data.map((u) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          assignedPlant: u.assignedPlant,
          workingDays: (u.workingHours || []).map((w) =>
            formatDay(w.day)
          ),
        }));

        setUsers(formatted);
        setItems(formatted.slice(0, ITEMS_PER_PAGE));
      }
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const hasMore = items.length < users.length;

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoadingMore(true);

    setTimeout(() => {
      setItems((prev) =>
        users.slice(0, prev.length + ITEMS_PER_PAGE)
      );
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }, 800);
  }, [hasMore, users]);

  // ================= ADD =================
  const handleAddUser = async () => {
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      assignedPlant: form.assignedPlant,
      workingHours: form.workingHours || [],
    };
  
    console.log("FINAL PAYLOAD:", payload);
  
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.message);
  
      toast.success("User created");
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ================= EDIT =================
  const handleUpdateUser = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/${selectedUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      if (res.ok) {
        toast.success("User updated");
        setSelectedUser(null);
        fetchUsers();
      }
    } catch {
      toast.error("Update failed");
    }
  };

  // ================= DELETE =================
  const handleDeleteUser = async () => {
    try {
      await fetch(
        `http://localhost:5000/api/auth/${deleteUserId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("User deleted");
      setDeleteUserId(null);
      fetchUsers();
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
      {/* ================= ADD BUTTON ================= */}
    <Modal>
    <Modal.Trigger>
    <Button variant="soft"  className="mb-4 bg-success-soft flex items-center gap-2 ">
      <Plus className="size-4" />
      Add New User
    </Button>
  </Modal.Trigger>

  <Modal.Backdrop>
    <Modal.Container placement="center">
      <Modal.Dialog className="sm:max-w-[540px]">
        <Modal.CloseTrigger />

        {/* HEADER */}
        <Modal.Header>
          <Modal.Icon variant="soft" color="success" className="bg-primary/10 text-primary">
            <Plus className="size-5 "  />
            
          </Modal.Icon>
          <Modal.Heading>Create New User</Modal.Heading>
        </Modal.Header>

        {/* BODY */}
        <Modal.Body className="flex flex-col gap-6">
<div className="flex justify-between mt-4">
          {/* NAME */}
          <div className="ml-2">
            <Label className=" mr-2"> Name:</Label>
            <Input
              placeholder="John Doe"
            
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="h-8 bg-warning-soft"
            />
          </div>

          {/* EMAIL */}
          <div className="">
            <Label className=" mr-2">Email:</Label>
            <Input
              placeholder="john@email.com"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="h-8 bg-warning-soft min-w-[250px]"
            />
          </div>
          </div>
          {/* PASSWORD */}
          <div>
            <Label className="mr-2">Password:</Label>
            <Input
              
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="h-8 bg-warning-soft min-w-[250px]"
            />
          </div>

          {/* ROLE (SELECT) */}
          <div>
  <Label>Role:</Label>

  <Autocomplete
    className="w-full"
    placeholder="Select role"
    selectionMode="single"
    value={selectedRole}
    onChange={(value) => {
      setSelectedRole(value);
      setForm((prev) => ({ ...prev, role: value }));
    }}
  >
    <Autocomplete.Trigger>
      <Autocomplete.Value />
      <Autocomplete.ClearButton />
      <Autocomplete.Indicator />
    </Autocomplete.Trigger>

    <Autocomplete.Popover>
      <ListBox>
        {roles.map((r) => (
          <ListBox.Item
            key={r.id}
            id={r.id}
            textValue={r.name}
          >
            {r.name}
            <ListBox.ItemIndicator />
          </ListBox.Item>
        ))}
      </ListBox>
    </Autocomplete.Popover>
  </Autocomplete>
</div>

          {/* PLANT (AUTOCOMPLETE) */}
          <div>
            <Label>Assigned Plant</Label>

            <Autocomplete
              className="w-full"
              placeholder="Select plant"
              selectionMode="single"
              value={selectedPlant}
              onChange={(value) => {
                setSelectedPlant(value);
                setForm((prev) => ({ ...prev, assignedPlant: value }));
              }}
            >
              <Autocomplete.Trigger>
                <Autocomplete.Value />
                <Autocomplete.ClearButton />
                <Autocomplete.Indicator />
              </Autocomplete.Trigger>

              <Autocomplete.Popover>
                <ListBox>
                {plants.map((p) => (
  <ListBox.Item key={p} id={p} textValue={p}>
    {p}
    <ListBox.ItemIndicator />
  </ListBox.Item>
))}
                </ListBox>
              </Autocomplete.Popover>
            </Autocomplete>
          </div>

          {/* WORKING DAYS (TAG MULTI SELECT) */}
          <div>
         

            <TagGroup
  selectedKeys={selectedDays}
  selectionMode="multiple"
  onSelectionChange={(keys) => {
    setSelectedDays(keys);

    const workingHours = Array.from(keys).map((day) => ({
      day,
      startTime: "07:00",
      endTime: "16:00",
    }));

    setForm((prev) => ({
      ...prev,
      workingHours,
    }));
  }}
>
  <Label>Working Days</Label>

  <TagGroup.List>
    {days.map((day) => (
      <Tag key={day.id} id={day.id}>
        {day.label}
      </Tag>
    ))}
  </TagGroup.List>

  <Description>
    Selected: {Array.from(selectedDays).join(", ") || "None"}
  </Description>
</TagGroup>
          </div>
        </Modal.Body>

        {/* FOOTER */}
        <Modal.Footer className="flex justify-end gap-2">
          <Button variant="secondary" slot="close">
            Cancel
          </Button>

          <Button
            className="flex items-center gap-2"
            onClick={handleAddUser}
          >
            <Plus className="size-4" />
            Create User
          </Button>
        </Modal.Footer>
      </Modal.Dialog>
    </Modal.Container>
  </Modal.Backdrop>
</Modal>

      {/* ================= TABLE ================= */}
      <Table className="max-h-[400px]" aria-label="Users management table">
        <Table.ScrollContainer className="max-h-[400px] overflow-y-auto">
          <Table.Content className="min-w-[700px]" aria-label="Users data table content" >
            <Table.Header>
              {columns.map((col) => (
                <Table.Column
                key={col.id}
                isRowHeader={col.id === "name"}   // 👈 REQUIRED FIX
              >
                {col.name}
              </Table.Column>
              ))}
            </Table.Header>

            <Table.Body
              renderEmptyState={() => (
                <EmptyState>
                  <PersonXmark />
                  No User found
                </EmptyState>
              )}
            >
              <Table.Collection items={items}>
                {(user) => (
                  <Table.Row key={user.id}>
                    <Table.Cell>{user.name}</Table.Cell>

                    <Table.Cell>
                      <Chip color={statusColorMap[user.role]} variant="soft">
                        {user.role}
                      </Chip>
                    </Table.Cell>

                    <Table.Cell>{user.email}</Table.Cell>
                    <Table.Cell>
                    <Chip variant="soft" color="primary">
                      {user.assignedPlant || "No Plant"}
                    </Chip>
                  </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-wrap gap-1">
                        {user.workingDays.map((d, i) => (
                          <Chip variant="soft" color="danger" key={i}>{d}</Chip>
                        ))}
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      <div className="flex gap-2">
                        {/* EDIT */}
                        <button
                        onClick={() => {
                          setSelectedUser(user);
                        
                          // restore full working days (convert back from Mon → Monday)
                          const reverseDayMap = {
                            Mon: "Monday",
                            Tue: "Tuesday",
                            Wed: "Wednesday",
                            Thu: "Thursday",
                            Fri: "Friday",
                            Sat: "Saturday",
                            Sun: "Sunday",
                          };
                        
                          const selectedDaysSet = new Set(
                            user.workingDays.map((d) => reverseDayMap[d])
                          );
                        
                          setSelectedDays(selectedDaysSet);
                        
                          setSelectedRole(user.role);
                          setSelectedPlant(user.assignedPlant || null);
                        
                          setForm({
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            assignedPlant: user.assignedPlant,
                            workingHours: Array.from(selectedDaysSet).map((day) => ({
                              day,
                              startTime: "07:00",
                              endTime: "16:00",
                            })),
                          });
                        }}
                        >
                          <Pencil />
                        </button>

                        {/* DELETE */}
                        <button onClick={() => setDeleteUserId(user.id)}>
                          <TrashBin />
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Collection>

              {!!hasMore && (
                <Table.LoadMore isLoading={isLoadingMore} onLoadMore={loadMore}>
                  <Spinner />
                </Table.LoadMore>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      {/* ================= EDIT MODAL ================= */}
      {selectedUser && (
  <Modal>
    <Modal.Backdrop isOpen onOpenChange={() => setSelectedUser(null)}>
      <Modal.Container placement="center">
        <Modal.Dialog className="sm:max-w-[540px]">
          <Modal.CloseTrigger />

          {/* HEADER */}
          <Modal.Header>
            <Modal.Icon variant="soft" color="warning">
              <Pencil className="size-5" />
            </Modal.Icon>
            <Modal.Heading>Edit User</Modal.Heading>
          </Modal.Header>

          {/* BODY */}
          <Modal.Body className="flex flex-col gap-6">

            {/* NAME + EMAIL */}
            <div className="flex justify-between mt-4">
              <div className="ml-2">
                <Label>Name:</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="h-8 bg-warning-soft"
                />
              </div>

              <div>
                <Label>Email:</Label>
                <Input
                  value={form.email}
                  disabled   // ❌ cannot edit
                  className="h-8 bg-gray-100 min-w-[250px]"
                />
              </div>
            </div>

            {/* ROLE */}
            <div>
              <Label>Role:</Label>

              <Autocomplete
                className="w-full"
                placeholder="Select role"
                selectionMode="single"
                value={selectedRole}
                onChange={(value) => {
                  setSelectedRole(value);
                  setForm((prev) => ({ ...prev, role: value }));
                }}
              >
                <Autocomplete.Trigger>
                  <Autocomplete.Value />
                  <Autocomplete.ClearButton />
                  <Autocomplete.Indicator />
                </Autocomplete.Trigger>

                <Autocomplete.Popover>
                  <ListBox>
                    {roles.map((r) => (
                      <ListBox.Item key={r.id} id={r.id} textValue={r.name}>
                        {r.name}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Autocomplete.Popover>
              </Autocomplete>
            </div>

            {/* PLANT */}
            <div>
              <Label>Assigned Plant</Label>

              <Autocomplete
                className="w-full"
                placeholder="Select plant"
                selectionMode="single"
                value={selectedPlant}
                onChange={(value) => {
                  setSelectedPlant(value);
                  setForm((prev) => ({ ...prev, assignedPlant: value }));
                }}
              >
                <Autocomplete.Trigger>
                  <Autocomplete.Value />
                  <Autocomplete.ClearButton />
                  <Autocomplete.Indicator />
                </Autocomplete.Trigger>

                <Autocomplete.Popover>
                  <ListBox>
                    {plants.map((p) => (
                      <ListBox.Item key={p} id={p} textValue={p}>
                        {p}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Autocomplete.Popover>
              </Autocomplete>
            </div>

            {/* WORKING DAYS */}
            <div>
              <TagGroup
                selectedKeys={selectedDays}
                selectionMode="multiple"
                onSelectionChange={(keys) => {
                  setSelectedDays(keys);

                  const workingHours = Array.from(keys).map((day) => ({
                    day,
                    startTime: "07:00",
                    endTime: "16:00",
                  }));

                  setForm((prev) => ({
                    ...prev,
                    workingHours,
                  }));
                }}
              >
                <Label>Working Days</Label>

                <TagGroup.List>
                  {days.map((day) => (
                    <Tag key={day.id} id={day.id}>
                      {day.label}
                    </Tag>
                  ))}
                </TagGroup.List>

                <Description>
                  Selected: {Array.from(selectedDays).join(", ") || "None"}
                </Description>
              </TagGroup>
            </div>
          </Modal.Body>

          {/* FOOTER */}
          <Modal.Footer className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>

            <Button onClick={handleUpdateUser}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  </Modal>
)}

      {/* ================= DELETE MODAL ================= */}
      {deleteUserId && (
        <Modal>
          <Modal.Backdrop isOpen onOpenChange={() => setDeleteUserId(null)}>
            <Modal.Container>
              <Modal.Dialog>
                <Modal.Header>
                  <Modal.Heading>Delete User?</Modal.Heading>
                </Modal.Header>

                <Modal.Body>
                  Are you sure you want to delete this user?
                </Modal.Body>

                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setDeleteUserId(null)}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={handleDeleteUser}>
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