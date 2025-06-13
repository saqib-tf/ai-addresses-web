"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AddressService } from "@/services/AddressService";
import { AddressTypeService } from "@/services/AddressTypeService";
import { CountryService } from "@/services/CountryService";
import { StateService } from "@/services/StateService";
import { Address } from "@/models/Address";
import { AddressType } from "@/models/AddressType";
import { State } from "@/models/State";
import { Country } from "@/models/Country";
import { extractApiErrorMessage } from "@/lib/extractApiErrorMessage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddressFormPage() {
  const params = useParams();
  const router = useRouter();
  const personId = params?.id ? Number(params.id) : undefined;
  const addressId = params?.addressId ? Number(params.addressId) : undefined;
  const isEdit = typeof addressId === "number" && !isNaN(addressId);

  const [address, setAddress] = useState<Partial<Address>>({ personId });
  const [addressTypes, setAddressTypes] = useState<AddressType[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<number | undefined>(undefined);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [addressTypesRes, countriesRes] = await Promise.all([
          AddressTypeService.getAll(),
          CountryService.getAll(),
        ]);
        setAddressTypes(addressTypesRes);
        setCountries(countriesRes);
        if (isEdit && addressId) {
          const addr = await AddressService.getById(addressId);
          setAddress(addr);
          setSelectedCountryId(addr.countryId || addr.state?.countryId);
        }
      } catch (err) {
        setError(extractApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isEdit, addressId]);

  useEffect(() => {
    async function fetchStates() {
      if (selectedCountryId) {
        try {
          setLoading(true);
          const result = await StateService.search({
            countryId: selectedCountryId,
            pageNumber: 1,
            pageSize: 100,
            sortDescending: false,
          });
          setStates(result.items);
        } catch (err) {
          setError(extractApiErrorMessage(err));
        } finally {
          setLoading(false);
        }
      } else {
        setStates([]);
      }
    }
    fetchStates();
  }, [selectedCountryId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit && addressId) {
        await AddressService.update(addressId, address as Address);
      } else {
        await AddressService.create(address as Address);
      }
      router.push(`/persons/${personId}/addresses`);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field: keyof Address | "countryId", value: unknown) {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (field === "stateId") {
      const state = states.find((s) => s.id === value);
      if (state) setSelectedCountryId(state.countryId);
    }
    if (field === "countryId") {
      setSelectedCountryId(value as number);
      setAddress((prev) => ({ ...prev, stateId: undefined }));
    }
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">{isEdit ? "Edit Address" : "Add Address"}</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Street</label>
            <Input
              value={address.street || ""}
              onChange={(e) => handleChange("street", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">City</label>
            <Input
              value={address.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Country</label>
            <Select
              value={selectedCountryId ? String(selectedCountryId) : undefined}
              onValueChange={(val) => handleChange("countryId", Number(val))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 font-medium">State</label>
            <Select
              value={address.stateId ? String(address.stateId) : undefined}
              onValueChange={(val) => handleChange("stateId", Number(val))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Postal Code</label>
            <Input
              value={address.postalCode || ""}
              onChange={(e) => handleChange("postalCode", e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Address Type</label>
            <Select
              value={address.addressTypeId ? String(address.addressTypeId) : undefined}
              onValueChange={(val) => handleChange("addressTypeId", Number(val))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {addressTypes.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="secondary" asChild>
              <Link href={`/persons/${personId}/addresses`}>Cancel</Link>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
