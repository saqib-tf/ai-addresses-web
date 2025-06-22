"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAddressService } from "@/services/AddressService";
import { usePersonService } from "@/services/PersonService";
import { Address } from "@/models/Address";
import { AddressSearchQuery } from "@/models/Address";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { extractApiErrorMessage } from "@/lib/extractApiErrorMessage";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { DEBOUNCE_SEARCH_MS } from "@/lib/constants";
import { useDebounce } from "use-debounce";

export default function PersonAddressesPage() {
  const params = useParams();
  const personId = params?.id ? Number(params.id) : undefined;
  const addressService = useAddressService();
  const personService = usePersonService();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDescending, setSortDescending] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedSearchTerm] = useDebounce(searchTerm, DEBOUNCE_SEARCH_MS);
  const [personName, setPersonName] = useState<string>("");

  useEffect(() => {
    if (typeof personId === "number") {
      setLoading(true);
      setError(null);
      addressService
        .search({
          personId,
          searchTerm: debouncedSearchTerm,
          sortBy,
          sortDescending,
          pageNumber,
          pageSize,
        } as AddressSearchQuery)
        .then((result) => {
          setAddresses(result.items);
          setTotalCount(result.totalCount);
        })
        .catch((err: unknown) => setError(extractApiErrorMessage(err)))
        .finally(() => setLoading(false));
      // Fetch person name
      personService.getById(personId).then((person) => {
        setPersonName([person.firstName, person.lastName].filter(Boolean).join(" "));
      });
    }
  }, [personId, debouncedSearchTerm, sortBy, sortDescending, pageNumber, pageSize]);

  async function handleDeleteAddress(id: number) {
    setDeleteLoading(true);
    setError(null);
    try {
      await addressService.delete(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(new Set(addresses.map((a) => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  }

  function handleSelectRow(id: number, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function handleBulkDelete() {
    setDeleteLoading(true);
    setError(null);
    try {
      for (const id of selectedIds) {
        await addressService.delete(id);
      }
      setAddresses((prev) => prev.filter((a) => !selectedIds.has(a.id)));
      setSelectedIds(new Set());
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setDeleteLoading(false);
      setBulkDeleteDialogOpen(false);
    }
  }

  function handleSort(field: string) {
    if (sortBy === field) setSortDescending(!sortDescending);
    else {
      setSortBy(field);
      setSortDescending(false);
    }
  }

  return (
    <div className="flex flex-col items-start min-h-[80dvh] w-full px-8 pt-8">
      <div className="flex items-center justify-between w-full mb-4">
        <h1 className="text-2xl font-bold">
          {personName ? `${personName} - Addresses` : "Addresses"}
        </h1>
        <div className="flex gap-2">
          <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                onClick={() => setBulkDeleteDialogOpen(true)}
                variant="destructive"
                disabled={selectedIds.size === 0 || deleteLoading}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Addresses</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the selected addresses? This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete} disabled={deleteLoading}>
                  {deleteLoading ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button asChild>
            <Link href={`/persons/${personId}/addresses/create`}>
              <Plus className="w-4 h-4" /> Add Address
            </Link>
          </Button>
        </div>
      </div>
      <Input
        placeholder="Search addresses..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setPageNumber(1);
        }}
        className="w-64 mb-4"
      />
      <div className="w-full">
        {loading ? (
          <div className="w-full text-center py-8">Loading...</div>
        ) : error ? (
          <div className="w-full text-center text-red-500 py-8">{error}</div>
        ) : addresses.length === 0 ? (
          <div className="w-full text-center py-8">No addresses found.</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <input
                      type="checkbox"
                      checked={
                        addresses.length > 0 && addresses.every((a) => selectedIds.has(a.id))
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("id")}
                    className="cursor-pointer select-none"
                  >
                    ID {sortBy === "id" && (sortDescending ? "↓" : "↑")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("street")}
                    className="cursor-pointer select-none"
                  >
                    Street {sortBy === "street" && (sortDescending ? "↓" : "↑")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("city")}
                    className="cursor-pointer select-none"
                  >
                    City {sortBy === "city" && (sortDescending ? "↓" : "↑")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("stateId")}
                    className="cursor-pointer select-none"
                  >
                    State, Country {sortBy === "stateId" && (sortDescending ? "↓" : "↑")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("postalCode")}
                    className="cursor-pointer select-none"
                  >
                    Postal Code {sortBy === "postalCode" && (sortDescending ? "↓" : "↑")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("addressTypeId")}
                    className="cursor-pointer select-none"
                  >
                    Type {sortBy === "addressTypeId" && (sortDescending ? "↓" : "↑")}
                  </TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {addresses.map((address) => (
                  <TableRow key={address.id}>
                    <TableCell className="w-8">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(address.id)}
                        onChange={(e) => handleSelectRow(address.id, e.target.checked)}
                        aria-label="Select row"
                      />
                    </TableCell>
                    <TableCell>{address.id}</TableCell>
                    <TableCell>{address.street}</TableCell>
                    <TableCell>{address.city}</TableCell>
                    <TableCell>
                      {address.state?.name ?? ""}
                      {address.state?.country?.name ? `, ${address.state.country.name}` : ""}
                    </TableCell>
                    <TableCell>{address.postalCode ?? ""}</TableCell>
                    <TableCell>{address.addressType?.name ?? ""}</TableCell>
                    <TableCell className="w-16">
                      <div className="flex gap-2 items-center">
                        <Link
                          href={`/persons/${personId}/addresses/${address.id}`}
                          aria-label="Edit"
                        >
                          <Pencil className="w-4 h-4 text-blue-600 hover:text-blue-800 cursor-pointer" />
                        </Link>
                        <AlertDialog
                          open={deleteId === address.id}
                          onOpenChange={(open) => setDeleteId(open ? address.id : null)}
                        >
                          <AlertDialogTrigger asChild>
                            <button aria-label="Delete" onClick={() => setDeleteId(address.id)}>
                              <Trash2 className="w-4 h-4 text-red-600 hover:text-red-800 cursor-pointer" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Address</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this address? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAddress(address.id)}
                                disabled={deleteLoading}
                              >
                                {deleteLoading ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4 w-full max-w-4xl">
              <div>
                Page {pageNumber} of {Math.ceil(totalCount / pageSize) || 1}
              </div>
              <div className="flex gap-2 items-center">
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPageNumber(pageNumber - 1)}
                  disabled={pageNumber === 1}
                >
                  Previous
                </button>
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPageNumber(pageNumber + 1)}
                  disabled={pageNumber * pageSize >= totalCount}
                >
                  Next
                </button>
                <select
                  className="ml-2 border rounded px-2 py-1"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPageNumber(1);
                  }}
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size} / page
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
