"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Country } from "@/models/Country";
import { useCountryService } from "@/services/CountryService";
import { toast } from "sonner";
import { extractApiErrorMessage } from "@/lib/extractApiErrorMessage";

export default function CountryFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id ? Number(params.id) : undefined;
  const isEdit = !!id;
  const countryService = useCountryService();

  const [form, setForm] = useState<Partial<Country>>({ code: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      countryService
        .getById(id!)
        .then((country) => setForm(country))
        .catch((err: unknown) => setError(extractApiErrorMessage(err, "Failed to load country.")))
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
        await countryService.update(id!, form as Country);
        toast.success("Country updated successfully");
      } else {
        await countryService.create(form as Country);
        toast.success("Country created successfully");
      }
      router.push("/settings/country");
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(err, "Failed to save country.");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded shadow">
      <h1 className="text-xl font-bold mb-4">{isEdit ? "Edit Country" : "Create Country"}</h1>
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
            onClick={() => router.push("/settings/country")}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
