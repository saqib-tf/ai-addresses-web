"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Gender } from "@/models/Gender";
import { GenderService } from "@/services/GenderService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { extractApiErrorMessage } from "@/lib/extractApiErrorMessage";

export default function GenderFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id ? Number(params.id) : undefined;
  const isEdit = !!id;

  const [form, setForm] = useState<Partial<Gender>>({ code: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      GenderService.getGenderById(id!)
        .then((gender) => setForm(gender))
        .catch((err: unknown) => setError(extractApiErrorMessage(err, "Failed to load gender.")))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        await GenderService.updateGender(id!, form as Gender);
        toast.success("Gender updated successfully");
      } else {
        await GenderService.createGender(form as Gender);
        toast.success("Gender created successfully");
      }
      router.push("/settings/gender");
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(err, "Failed to save gender.");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded shadow">
      <h1 className="text-xl font-bold mb-4">{isEdit ? "Edit Gender" : "Create Gender"}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          name="code"
          placeholder="Code"
          value={form.code || ""}
          onChange={handleChange}
          required
        />
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
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/settings/gender")}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
