"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { StateService } from "@/services/StateService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { extractApiErrorMessage } from "@/lib/extractApiErrorMessage";

export default function StateFormPage() {
  const router = useRouter();
  const params = useParams();
  const countryId = Number(params.id);
  const stateId = params.stateId ? Number(params.stateId) : undefined;
  const isEdit = Boolean(stateId);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      StateService.getById(stateId!)
        .then((data) => {
          setName(data.name);
          setCode(data.code);
        })
        .catch((err: unknown) => setError(extractApiErrorMessage(err, "Failed to load state.")))
        .finally(() => setLoading(false));
    }
  }, [isEdit, stateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await StateService.update(stateId!, { id: stateId!, name, code, countryId, country: null });
        toast.success("State updated");
      } else {
        await StateService.create({ id: 0, name, code, countryId, country: null });
        toast.success("State created");
      }
      router.back();
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(err, `Failed to ${isEdit ? "update" : "create"} state`);
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">{isEdit ? "Edit State" : "Create State"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="State name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          placeholder="State code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? (isEdit ? "Saving..." : "Saving...") : isEdit ? "Save Changes" : "Save"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()} disabled={saving}>
            Cancel
          </Button>
        </div>
        {error && <div className="text-red-500">{error}</div>}
      </form>
    </div>
  );
}
