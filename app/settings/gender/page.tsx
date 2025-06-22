"use client";

import { useEffect, useState } from "react";
import { Gender } from "../../../models/Gender";
import { useGenderService } from "../../../services/GenderService";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Link from "next/link";
import { Pencil, Trash, Plus } from "lucide-react";
import { PagedQuery } from "../../../models/PagedQuery";
import { PagedResult } from "../../../models/PagedResult";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { extractApiErrorMessage } from "@/lib/extractApiErrorMessage";
import { DEBOUNCE_SEARCH_MS } from "@/lib/constants";
import { useSession } from "next-auth/react";

export default function GenderSettingsPage() {
  const { status } = useSession();
  const genderService = useGenderService();
  const [genders, setGenders] = useState<Gender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDescending, setSortDescending] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedSearchTerm] = useDebounce(searchTerm, DEBOUNCE_SEARCH_MS);
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const fetchData = () => {
    setLoading(true);
    const query: PagedQuery = {
      searchTerm: debouncedSearchTerm || undefined,
      sortBy,
      sortDescending,
      pageNumber,
      pageSize,
    };
    genderService
      .search(query)
      .then((result: PagedResult<Gender>) => {
        setGenders(result.items);
        setTotalCount(result.totalCount);
      })
      .catch((err: unknown) => {
        const msg = extractApiErrorMessage(err, "Failed to load genders.");
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (status !== "loading") {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, sortBy, sortDescending, pageNumber, pageSize, status]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDescending(!sortDescending);
    } else {
      setSortBy(column);
      setSortDescending(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    setError(null);
    try {
      await genderService.deleteGender(id);
      setDeleteId(null);
      fetchData();
      toast.success("Gender deleted successfully");
    } catch (err: unknown) {
      const msg = extractApiErrorMessage(err, "Failed to delete gender.");
      setError(msg);
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // Select all rows in current page
  const allSelected = genders.length > 0 && genders.every((g) => selectedIds.includes(g.id));
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(selectedIds.filter((id) => !genders.some((g) => g.id === id)));
    } else {
      setSelectedIds([
        ...selectedIds,
        ...genders.filter((g) => !selectedIds.includes(g.id)).map((g) => g.id),
      ]);
    }
  };
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const handleBulkDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await Promise.all(selectedIds.map((id) => genderService.deleteGender(id)));
      setSelectedIds([]);
      setBulkDeleteDialogOpen(false);
      fetchData();
      toast.success("Selected genders deleted successfully");
    } catch {
      setError("Failed to delete selected genders.");
      toast.error("Failed to delete selected genders");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Gender Settings</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Manage gender settings here.</p>
      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center justify-between">
        <Input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPageNumber(1);
          }}
          className="w-64"
        />
        <div className="flex gap-2 w-fit">
          <Button
            type="button"
            className="w-fit flex items-center gap-2"
            onClick={() => router.push("/settings/gender/create")}
          >
            <Plus className="w-4 h-4" />
            Create Gender
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
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Genders</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} selected gender
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
              {genders.map((gender) => (
                <TableRow key={gender.id}>
                  <TableCell className="w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(gender.id)}
                      onChange={() => toggleSelect(gender.id)}
                      aria-label={`Select gender ${gender.name}`}
                    />
                  </TableCell>
                  <TableCell>{gender.id}</TableCell>
                  <TableCell>{gender.code}</TableCell>
                  <TableCell>{gender.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/settings/gender/${gender.id}/edit`} title="Edit">
                        <Pencil className="w-4 h-4 text-blue-600 hover:text-blue-800 cursor-pointer" />
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button title="Delete" onClick={() => setDeleteId(gender.id)}>
                            <Trash className="w-4 h-4 text-red-600 hover:text-red-800 cursor-pointer" />
                          </button>
                        </AlertDialogTrigger>
                        {deleteId === gender.id && (
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Gender</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete gender <b>{gender.name}</b>? This
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
                                onClick={() => handleDelete(gender.id)}
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
