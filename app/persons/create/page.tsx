"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PersonService } from "@/services/PersonService";
import { GenderService } from "@/services/GenderService";
import { extractApiErrorMessage } from "@/lib/extractApiErrorMessage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Person } from "@/models/Person";
import { Gender } from "@/models/Gender";
import { getTodayDateString } from "@/lib/getTodayDateString";
import { DEBOUNCE_SEARCH_MS } from "@/lib/constants";
import Image from "next/image";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(FilePondPluginImagePreview);

export default function PersonFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const isEdit = Boolean(id);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(getTodayDateString());
  const [genderId, setGenderId] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [filePondFiles, setFilePondFiles] = useState<any[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    setInitialLoading(true);
    PersonService.getById(Number(id))
      .then((data: Person) => {
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setDateOfBirth(data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : getTodayDateString());
        setGenderId(data.genderId ? String(data.genderId) : "");
        setProfilePictureUrl(data.profilePictureUrl || "");
      })
      .catch((err) => setError(extractApiErrorMessage(err)))
      .finally(() => setInitialLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    GenderService.getAll()
      .then((genders) => {
        setGenders(genders);
        if (!isEdit && genders.length > 0) {
          setTimeout(() => {
            setGenderId(String(genders[0].id));
          }, DEBOUNCE_SEARCH_MS);
        }
      })
      .catch(() => setGenders([]));
  }, [isEdit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        await PersonService.update(Number(id), {
          firstName,
          lastName,
          dateOfBirth,
          genderId: genderId && genderId !== "" ? Number(genderId) : 0,
          profilePictureUrl: profilePictureUrl || "",
        });
      } else {
        await PersonService.create({
          firstName,
          lastName,
          dateOfBirth,
          genderId: genderId && genderId !== "" ? Number(genderId) : 0,
          profilePictureUrl: profilePictureUrl || "",
        });
      }
      router.push("/persons");
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleFilePondUpdate(fileItems: any[]) {
    setFilePondFiles(fileItems);
    if (fileItems.length > 0) {
      const file = fileItems[0].file;
      try {
        const path = await PersonService.uploadImage(file);
        setProfilePictureUrl(path);
      } catch {
        setError("Failed to upload image");
      }
    }
  }

  if (initialLoading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">{isEdit ? "Edit Person" : "Create Person"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <Input
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <Input
          type="date"
          placeholder="Date of Birth"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <Select value={genderId} onValueChange={setGenderId} required={true}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              {genders.map((g) => (
                <SelectItem key={g.id} value={String(g.id)}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Profile Picture</label>
          <div className="flex items-center gap-4">
            {profilePictureUrl && (
              <Image
                src={profilePictureUrl}
                alt="Profile Preview"
                width={120}
                height={120}
                className="rounded-full border"
              />
            )}
            <div className="w-48">
              <FilePond
                files={filePondFiles}
                onupdatefiles={handleFilePondUpdate}
                allowMultiple={false}
                maxFiles={1}
                name="file"
                labelIdle="Drag & Drop your image or <span class='filepond--label-action'>Browse</span>"
                acceptedFileTypes={["image/*"]}
              />
            </div>
          </div>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? (isEdit ? "Saving..." : "Creating...") : isEdit ? "Save" : "Create"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
