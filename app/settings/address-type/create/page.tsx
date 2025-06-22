"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { AddressType } from "@/models/AddressType";
import { useAddressTypeService } from "@/services/AddressTypeService";
import { toast } from "sonner";
import { extractApiErrorMessage } from "@/lib/extractApiErrorMessage";

export default function AddressTypeCreateOrEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id ? Number(params.id) : undefined;
  const isEdit = !!id;
  const addressTypeService = useAddressTypeService();
  const [form, setForm] = useState<Partial<AddressType>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      addressTypeService
        .getById(id)
        .then((data) => setForm(data))
        .catch((err: unknown) =>
          setError(extractApiErrorMessage(err, "Failed to load address type."))
        )
        .finally(() => setLoading(false));
    }
  }, [isEdit, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEdit && id) {
        await addressTypeService.update(id, form as AddressType);
        toast.success("Address type updated successfully");
      } else {
        await addressTypeService.create(form as AddressType);
        toast.success("Address type created successfully");
      }
      router.push("/settings/address-type");
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(err, "Failed to save address type.");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit" : "Create"} Address Type</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          name="name"
          placeholder="Name"
          value={form.name || ""}
          onChange={handleChange}
          required
        />
        {error && <div className="text-red-500">{error}</div>}
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? (isEdit ? "Updating..." : "Creating...") : isEdit ? "Update" : "Create"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/settings/address-type")}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
