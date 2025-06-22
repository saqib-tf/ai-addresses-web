"use client";

import { useEffect, useState } from "react";
import { usePersonService } from "@/services/PersonService";
import { Person } from "@/models/Person";
import { PagedQuery } from "@/models/PagedQuery";
import { PagedResult } from "@/models/PagedResult";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";
import Image from "next/image";
import { User } from "lucide-react";
import { DEBOUNCE_SEARCH_MS } from "@/lib/constants";
import { extractApiErrorMessage } from "@/lib/extractApiErrorMessage";
import Link from "next/link";
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
import { Trash2, Pencil, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PersonsPage() {
  const personService = usePersonService();
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDescending, setSortDescending] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [imageErrorIds, setImageErrorIds] = useState<Set<number>>(new Set());
  const [debouncedSearchTerm] = useDebounce(searchTerm, DEBOUNCE_SEARCH_MS);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, sortBy, sortDescending, pageNumber, pageSize]);

  function fetchData() {
    setLoading(true);
    setError(null);
    const query: PagedQuery = {
      pageNumber,
      pageSize,
      searchTerm: debouncedSearchTerm,
      sortBy,
      sortDescending,
    };
    personService
      .search(query)
      .then((result: PagedResult<Person>) => {
        setPersons(result.items);
        setTotalCount(result.totalCount);
      })
      .catch((err) => setError(extractApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  function handleSort(field: string) {
    if (sortBy === field) setSortDescending(!sortDescending);
    else {
      setSortBy(field);
      setSortDescending(false);
    }
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(new Set(persons.filter((p) => typeof p.id === "number").map((p) => p.id!)));
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

  async function handleDeletePerson(id: number) {
    setDeleteLoading(true);
    setError(null);
    try {
      await personService.delete(id);
      fetchData();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-col items-start min-h-[80dvh] w-full px-8 pt-8">
        <div className="flex items-center justify-between w-full mb-4">
          <h1 className="text-3xl font-bold">Persons</h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => (window.location.href = "/persons/create")}>
              <Plus className="w-4 h-4" />
              Create Person
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={selectedIds.size === 0}>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Persons</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the selected persons?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      setDeleteLoading(true);
                      setError(null);
                      try {
                        for (const id of selectedIds) {
                          await personService.delete(id);
                        }
                        setSelectedIds(new Set());
                        fetchData();
                      } catch (err) {
                        setError(extractApiErrorMessage(err));
                      } finally {
                        setDeleteLoading(false);
                      }
                    }}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <Input
          placeholder="Search persons..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPageNumber(1);
          }}
          className="mb-4 w-full max-w-md"
        />
        <div className="w-full">
          {loading ? (
            <div className="w-full text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <input
                      type="checkbox"
                      checked={
                        persons.length > 0 &&
                        persons.every((p) => typeof p.id === "number" && selectedIds.has(p.id))
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
                    onClick={() => handleSort("firstName")}
                    className="cursor-pointer select-none"
                  >
                    Name {sortBy === "firstName" && (sortDescending ? "↓" : "↑")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("dateOfBirth")}
                    className="cursor-pointer select-none"
                  >
                    Date of Birth {sortBy === "dateOfBirth" && (sortDescending ? "↓" : "↑")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("genderId")}
                    className="cursor-pointer select-none"
                  >
                    Gender {sortBy === "genderId" && (sortDescending ? "↓" : "↑")}
                  </TableHead>
                  <TableHead>Profile Picture</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-red-500 py-8">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : persons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No persons found.
                    </TableCell>
                  </TableRow>
                ) : (
                  persons.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell className="w-8">
                        {typeof person.id === "number" && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(person.id)}
                            onChange={(e) => handleSelectRow(person.id!, e.target.checked)}
                            aria-label="Select row"
                          />
                        )}
                      </TableCell>
                      <TableCell>{person.id}</TableCell>
                      <TableCell>
                        {typeof person.id === "number" ? (
                          <Link
                            href={`/persons/${person.id}/edit`}
                            className="text-blue-600 hover:underline"
                          >
                            {[person.firstName, person.lastName].filter(Boolean).join(" ")}
                          </Link>
                        ) : (
                          [person.firstName, person.lastName].filter(Boolean).join(" ")
                        )}
                      </TableCell>
                      <TableCell>
                        {person.dateOfBirth ? person.dateOfBirth.slice(0, 10) : ""}
                      </TableCell>
                      <TableCell>{person.gender?.name ?? ""}</TableCell>
                      <TableCell>
                        {person.profilePictureUrl &&
                        typeof person.id === "number" &&
                        !imageErrorIds.has(person.id) ? (
                          <Image
                            src={`${person.profilePictureUrl}`}
                            alt="Profile"
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full"
                            onError={() => {
                              if (typeof person.id === "number") {
                                setImageErrorIds((prev) => new Set(prev).add(person.id!));
                              }
                            }}
                          />
                        ) : (
                          <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-400" />
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="w-16">
                        {typeof person.id === "number" && (
                          <div className="flex gap-2 items-center">
                            <Link href={`/persons/${person.id}/edit`} aria-label="Edit">
                              <Pencil className="w-4 h-4 text-blue-600 hover:text-blue-800 cursor-pointer" />
                            </Link>
                            <Link href={`/persons/${person.id}/addresses`} aria-label="Addresses">
                              <MapPin className="w-4 h-4 text-green-600 hover:text-green-800 cursor-pointer" />
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button aria-label="Delete">
                                  <Trash2 className="w-4 h-4 text-red-600 hover:text-red-800 cursor-pointer" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Person</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this person?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePerson(person.id!)}
                                    disabled={deleteLoading}
                                  >
                                    {deleteLoading ? "Deleting..." : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
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
      </div>
    </>
  );
}
