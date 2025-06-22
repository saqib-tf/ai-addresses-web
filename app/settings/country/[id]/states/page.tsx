"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { State } from "@/models/State";
import { useStateService } from "@/services/StateService";
import { useCountryService } from "@/services/CountryService";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash } from "lucide-react";
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
import { useDebounce } from "use-debounce";
import Link from "next/link";
import { PagedResult } from "@/models/PagedResult";
import { toast } from "sonner";
import { extractApiErrorMessage } from "@/lib/extractApiErrorMessage";
import { DEBOUNCE_SEARCH_MS } from "@/lib/constants";

export default function CountryStatesPage() {
  const stateService = useStateService();
  const countryService = useCountryService();
  const params = useParams();
  const countryId = Number(params.id);

  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDescending, setSortDescending] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedSearchTerm] = useDebounce(searchTerm, DEBOUNCE_SEARCH_MS);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [countryName, setCountryName] = useState<string>("");

  useEffect(() => {
    if (!countryId) return;
    setLoading(true);
    setError(null);
    const query = {
      pageNumber,
      pageSize,
      searchTerm: debouncedSearchTerm,
      sortBy,
      sortDescending,
      countryId, // Pass countryId for server-side filtering
    };
    stateService
      .search(query)
      .then((result: PagedResult<State>) => {
        setStates(result.items);
        setTotalCount(result.totalCount);
      })
      .catch((err: unknown) => {
        const msg = extractApiErrorMessage(err, "Failed to load states.");
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, [countryId, debouncedSearchTerm, sortBy, sortDescending, pageNumber, pageSize]);

  useEffect(() => {
    if (!countryId) return;
    countryService
      .getById(countryId)
      .then((country) => setCountryName(country.name))
      .catch(() => setCountryName(""));
  }, [countryId]);

  const handleSort = (field: string) => {
    if (sortBy === field) setSortDescending(!sortDescending);
    else {
      setSortBy(field);
      setSortDescending(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await stateService.delete(id);
      toast.success("State deleted");
      setStates((prev) => prev.filter((s) => s.id !== id));
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(err, "Failed to delete state");
      toast.error(msg);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => stateService.delete(id)));
      toast.success("Selected states deleted");
      setStates((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
      setSelectedIds([]);
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(err, "Failed to delete states");
      toast.error(msg);
    } finally {
      setDeleting(false);
      setBulkDeleteDialogOpen(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };
  const allSelected = states.length > 0 && selectedIds.length === states.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(states.map((s) => s.id));
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">States{countryName ? ` of ${countryName}` : ""}</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/settings/country/${countryId}/states/create`}>
              <Plus className="w-4 h-4" />
              Create
            </Link>
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="w-fit flex items-center gap-2"
            disabled={selectedIds.length === 0}
            onClick={() => setBulkDeleteDialogOpen(true)}
          >
            <Trash className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>
      <Input
        placeholder="Search states..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected States</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} selected state
              {selectedIds.length > 1 ? "s" : ""}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} onClick={() => setBulkDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction disabled={deleting} onClick={handleBulkDelete}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead onClick={() => handleSort("id")} className="cursor-pointer select-none">
                  ID {sortBy === "id" && (sortDescending ? "↓" : "↑")}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("code")}
                  className="cursor-pointer select-none"
                >
                  Code {sortBy === "code" && (sortDescending ? "↓" : "↑")}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("name")}
                  className="cursor-pointer select-none"
                >
                  Name {sortBy === "name" && (sortDescending ? "↓" : "↑")}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {states.map((state) => (
                <TableRow key={state.id}>
                  <TableCell className="w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(state.id)}
                      onChange={() => toggleSelect(state.id)}
                      aria-label={`Select state ${state.name}`}
                    />
                  </TableCell>
                  <TableCell>{state.id}</TableCell>
                  <TableCell>{state.code}</TableCell>
                  <TableCell>{state.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link
                        href={`/settings/country/${countryId}/states/${state.id}/edit`}
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4 text-blue-600 hover:text-blue-800 cursor-pointer" />
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button title="Delete" onClick={() => setDeleteId(state.id)}>
                            <Trash className="w-4 h-4 text-red-600 hover:text-red-800 cursor-pointer" />
                          </button>
                        </AlertDialogTrigger>
                        {deleteId === state.id && (
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete State</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete state <b>{state.name}</b>? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                disabled={deleting}
                                onClick={() => setDeleteId(null)}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                disabled={deleting}
                                onClick={() => handleDelete(state.id)}
                              >
                                {deleting ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        )}
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4">
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
    </>
  );
}
